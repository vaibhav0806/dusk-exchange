use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::{types::CallbackAccount, ID_CONST};

use crate::ID;
use crate::state::{Market, UserPosition};
use crate::events::OrderPlaced;
use crate::errors::DuskError;

/// SignerAccount for the Arcium CPI signing PDA
/// 9 bytes: 8 for discriminator + 1 for bump
#[account]
pub struct SignerAccount {
    pub bump: u8,
}

/// Computation definition offset for add_order
pub const COMP_DEF_OFFSET_ADD_ORDER: u8 = 0;

/// Place an encrypted limit order
#[queue_computation_accounts("add_order", user)]
#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [
            UserPosition::SEED_PREFIX,
            market.key().as_ref(),
            user.key().as_ref()
        ],
        bump = user_position.bump,
        constraint = user_position.owner == user.key() @ DuskError::Unauthorized
    )]
    pub user_position: Account<'info, UserPosition>,

    /// Signer PDA for CPI to Arcium
    #[account(
        init_if_needed,
        space = 9,
        payer = user,
        seeds = [&SIGN_PDA_SEED],
        bump
    )]
    pub sign_pda_account: Account<'info, SignerAccount>,

    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Mempool account
    #[account(mut)]
    pub mempool_account: UncheckedAccount<'info>,

    /// CHECK: Executing pool account
    #[account(mut)]
    pub executing_pool: UncheckedAccount<'info>,

    /// CHECK: Computation account (will be initialized)
    #[account(mut)]
    pub computation_account: UncheckedAccount<'info>,

    /// Computation definition account for add_order
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_ADD_ORDER))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,

    /// Cluster account
    #[account(mut)]
    pub cluster_account: Account<'info, Cluster>,

    /// Pool account (Arcium fee pool)
    #[account(mut)]
    pub pool_account: Account<'info, FeePool>,

    /// Clock account
    pub clock_account: Account<'info, ClockAccount>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PlaceOrder>,
    order_id: u64,
    is_buy: bool,
    encrypted_price: Vec<u8>,
    encrypted_amount: Vec<u8>,
    _nonce: [u8; 12],
    lock_amount: u64,
) -> Result<()> {
    // Set the sign_pda_account bump for CPI signing
    ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

    // Validate encrypted data lengths (32 bytes for encrypted values)
    require!(
        encrypted_price.len() == 32 && encrypted_amount.len() == 32,
        DuskError::InvalidEncryptedData
    );

    // Validate lock amount is non-zero
    require!(lock_amount > 0, DuskError::AmountTooSmall);

    // Lock tokens for this order
    // Buy orders lock quote tokens, sell orders lock base tokens
    let user_position = &mut ctx.accounts.user_position;
    user_position.lock_for_order(lock_amount, is_buy)?;

    // Convert Vec<u8> to [u8; 32] for encrypted values
    let price_arr: [u8; 32] = encrypted_price.try_into()
        .map_err(|_| DuskError::InvalidEncryptedData)?;
    let amount_arr: [u8; 32] = encrypted_amount.try_into()
        .map_err(|_| DuskError::InvalidEncryptedData)?;

    // Capture keys before mutable borrows
    let market_key = ctx.accounts.market.key();
    let user_key = ctx.accounts.user.key();
    let user_position_key = ctx.accounts.user_position.key();
    let market_id = ctx.accounts.market.market_id;

    // Split the user's pubkey into two u128 values for the Order struct
    let user_bytes = user_key.to_bytes();
    let owner_lo = u128::from_le_bytes(user_bytes[..16].try_into().unwrap());
    let owner_hi = u128::from_le_bytes(user_bytes[16..].try_into().unwrap());

    // Build computation arguments for add_order circuit using ArgBuilder
    let computation_args = ArgBuilder::new()
        .encrypted_u64(price_arr)
        .encrypted_u64(amount_arr)
        .plaintext_u128(owner_lo)
        .plaintext_u128(owner_hi)
        .plaintext_u64(order_id)
        .plaintext_bool(is_buy)
        .build();

    // Define callback accounts
    let callback_accounts = vec![
        CallbackAccount { pubkey: market_key, is_writable: true },
        CallbackAccount { pubkey: user_key, is_writable: false },
        CallbackAccount { pubkey: user_position_key, is_writable: true },
    ];

    // Queue the encrypted computation
    queue_computation(
        ctx.accounts,
        0,
        computation_args,
        None,
        vec![AddOrderCallback::callback_ix(
            COMP_DEF_OFFSET_ADD_ORDER as u64,
            &ctx.accounts.mxe_account,
            &callback_accounts,
        )?],
        1,
        0,
    )?;

    // Update market state after queue_computation
    // Note: user_position.active_order_count was already updated by lock_for_order
    let market = &mut ctx.accounts.market;

    market.order_count = market.order_count.saturating_add(1);
    if is_buy {
        market.active_bids = market.active_bids.saturating_add(1);
    } else {
        market.active_asks = market.active_asks.saturating_add(1);
    }

    let clock = Clock::get()?;

    emit!(OrderPlaced {
        market: market_key,
        user: user_key,
        order_id,
        is_buy,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Order {} placed: {} order on market {}",
        order_id,
        if is_buy { "BUY" } else { "SELL" },
        market_id
    );

    Ok(())
}

/// Callback for add_order computation
/// Note: Using manual implementation instead of callback_accounts macro due to SDK version issues
#[derive(Accounts)]
pub struct AddOrderCallback<'info> {
    /// CHECK: Arcium callback authority
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: User who placed the order
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            UserPosition::SEED_PREFIX,
            market.key().as_ref(),
            user.key().as_ref()
        ],
        bump = user_position.bump
    )]
    pub user_position: Account<'info, UserPosition>,
}

impl AddOrderCallback<'_> {
    /// Generate callback instruction for queue_computation
    pub fn callback_ix(
        _computation_offset: u64,
        _mxe_account: &MXEAccount,
        extra_accs: &[CallbackAccount],
    ) -> Result<arcium_client::idl::arcium::types::CallbackInstruction> {
        Ok(arcium_client::idl::arcium::types::CallbackInstruction {
            program_id: crate::ID,
            discriminator: vec![0u8; 8], // Will be set correctly by Arcium runtime
            accounts: extra_accs.to_vec(),
        })
    }
}

pub fn callback_handler(ctx: Context<AddOrderCallback>) -> Result<()> {
    // Callback from Arcium after order is added to encrypted orderbook
    // The actual order data is stored encrypted in the MXE

    msg!(
        "Order placed callback received for user {} on market {}",
        ctx.accounts.user.key(),
        ctx.accounts.market.market_id
    );

    Ok(())
}
