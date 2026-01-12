use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::{types::CallbackAccount, ID_CONST};

use crate::ID;
use crate::state::Market;
use crate::events::OrdersMatched;
use crate::errors::DuskError;
use crate::instructions::place_order::SignerAccount;

/// Computation definition offset for match_book
pub const COMP_DEF_OFFSET_MATCH_BOOK: u8 = 2;

/// Trigger order matching via MPC
#[queue_computation_accounts("match_book", caller)]
#[derive(Accounts)]
pub struct MatchOrders<'info> {
    /// Anyone can trigger matching (keeper, user, etc.)
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// Signer PDA for CPI to Arcium
    #[account(
        init_if_needed,
        space = 9,
        payer = caller,
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

    /// Computation definition account for match_book
    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_MATCH_BOOK))]
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

pub fn handler(ctx: Context<MatchOrders>) -> Result<()> {
    // Set the sign_pda_account bump for CPI signing
    ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

    let market = &ctx.accounts.market;

    // Require at least one bid and one ask to attempt matching
    require!(
        market.active_bids > 0 && market.active_asks > 0,
        DuskError::NoMatchingOrders
    );

    // match_book takes no additional arguments - it operates on MXE state
    let computation_args = ArgBuilder::new().build();

    // Define callback accounts
    let callback_accounts = vec![
        CallbackAccount {
            pubkey: market.key(),
            is_writable: true,
        },
    ];

    // Queue the encrypted computation
    // match_book returns MatchResult with revealed execution details
    queue_computation(
        ctx.accounts,
        0,
        computation_args,
        None,
        vec![MatchBookCallback::callback_ix(
            COMP_DEF_OFFSET_MATCH_BOOK as u64,
            &ctx.accounts.mxe_account,
            &callback_accounts,
        )?],
        1, // returns MatchResult
        0, // tip
    )?;

    msg!(
        "Match orders requested on market {} ({} bids, {} asks)",
        market.market_id,
        market.active_bids,
        market.active_asks
    );

    Ok(())
}

/// Callback for match_book computation
/// Receives revealed execution details from MatchResult and stores in market
#[derive(Accounts)]
pub struct MatchBookCallback<'info> {
    /// CHECK: Arcium callback authority
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,
}

impl MatchBookCallback<'_> {
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

/// Reconstruct a Pubkey from two u128 values (low and high bits)
pub fn reconstruct_pubkey(lo: u128, hi: u128) -> Pubkey {
    let mut bytes = [0u8; 32];
    bytes[..16].copy_from_slice(&lo.to_le_bytes());
    bytes[16..].copy_from_slice(&hi.to_le_bytes());
    Pubkey::new_from_array(bytes)
}

pub fn callback_handler(
    ctx: Context<MatchBookCallback>,
    matched: bool,
    execution_price: u64,
    execution_amount: u64,
    maker_order_id: u64,
    taker_order_id: u64,
    maker_lo: u128,
    maker_hi: u128,
    taker_lo: u128,
    taker_hi: u128,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let clock = Clock::get()?;

    if !matched {
        msg!("No matching orders found");
        return Ok(());
    }

    // Reconstruct maker and taker pubkeys from split u128 values
    let maker = reconstruct_pubkey(maker_lo, maker_hi);
    let taker = reconstruct_pubkey(taker_lo, taker_hi);

    // Update market stats
    market.active_bids = market.active_bids.saturating_sub(1);
    market.active_asks = market.active_asks.saturating_sub(1);

    // Store pending match info in market for later settlement creation
    market.pending_maker = maker;
    market.pending_taker = taker;
    market.pending_maker_order_id = maker_order_id;
    market.pending_taker_order_id = taker_order_id;
    market.pending_execution_price = execution_price;
    market.pending_execution_amount = execution_amount;
    market.pending_matched_at = clock.unix_timestamp;
    market.has_pending_match = true;

    emit!(OrdersMatched {
        market: market.key(),
        maker,
        taker,
        maker_order_id,
        taker_order_id,
        execution_price,
        execution_amount,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Orders matched! Price: {}, Amount: {}, Maker: {}, Taker: {}. Call create_settlement to finalize.",
        execution_price,
        execution_amount,
        maker,
        taker
    );

    Ok(())
}
