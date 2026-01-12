use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::{types::CallbackAccount, ID_CONST};

use crate::ID;
use crate::state::{Market, UserPosition};
use crate::events::OrderCancelled;
use crate::errors::DuskError;
use crate::instructions::place_order::SignerAccount;

/// Computation definition offset for remove_order
pub const COMP_DEF_OFFSET_REMOVE_ORDER: u8 = 1;

/// Cancel an existing order
#[queue_computation_accounts("remove_order", user)]
#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct CancelOrder<'info> {
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

    /// Computation definition account for remove_order
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_REMOVE_ORDER))]
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

pub fn handler(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
    // Set the sign_pda_account bump for CPI signing
    ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

    let market = &ctx.accounts.market;

    require!(
        ctx.accounts.user_position.active_order_count > 0,
        DuskError::OrderNotFound
    );

    // Split the user's pubkey into two u128 values
    let user_bytes = ctx.accounts.user.key().to_bytes();
    let owner_lo = u128::from_le_bytes(user_bytes[..16].try_into().unwrap());
    let owner_hi = u128::from_le_bytes(user_bytes[16..].try_into().unwrap());

    // Build computation arguments for remove_order circuit using ArgBuilder
    let computation_args = ArgBuilder::new()
        .plaintext_u64(order_id)
        .plaintext_u128(owner_lo)
        .plaintext_u128(owner_hi)
        .build();

    // Define callback accounts
    let callback_accounts = vec![
        CallbackAccount {
            pubkey: market.key(),
            is_writable: true,
        },
        CallbackAccount {
            pubkey: ctx.accounts.user.key(),
            is_writable: false,
        },
        CallbackAccount {
            pubkey: ctx.accounts.user_position.key(),
            is_writable: true,
        },
    ];

    // Queue the encrypted computation
    queue_computation(
        ctx.accounts,
        0,
        computation_args,
        None,
        vec![RemoveOrderCallback::callback_ix(
            COMP_DEF_OFFSET_REMOVE_ORDER as u64,
            &ctx.accounts.mxe_account,
            &callback_accounts,
        )?],
        1, // returns bool indicating if order was removed
        0, // tip
    )?;

    msg!(
        "Cancel order {} requested on market {}",
        order_id,
        market.market_id
    );

    Ok(())
}

/// Callback for remove_order computation
#[derive(Accounts)]
pub struct RemoveOrderCallback<'info> {
    /// CHECK: Arcium callback authority
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: User who cancelled the order
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

impl RemoveOrderCallback<'_> {
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

pub fn callback_handler(ctx: Context<RemoveOrderCallback>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_position = &mut ctx.accounts.user_position;

    // Decrement active order count
    user_position.active_order_count = user_position
        .active_order_count
        .saturating_sub(1);

    // Note: The callback would receive the 'removed' bool from MPC
    // For now, we assume success and emit the event

    emit!(OrderCancelled {
        market: market.key(),
        user: ctx.accounts.user.key(),
        order_id: 0, // Would come from callback data
    });

    msg!(
        "Order cancelled for user {} on market {}",
        ctx.accounts.user.key(),
        market.market_id
    );

    Ok(())
}
