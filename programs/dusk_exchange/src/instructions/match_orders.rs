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
/// Receives revealed execution details from MatchResult
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

pub fn callback_handler(
    ctx: Context<MatchBookCallback>,
    matched: bool,
    execution_price: u64,
    execution_amount: u64,
    maker_order_id: u64,
    taker_order_id: u64,
) -> Result<()> {
    if !matched {
        msg!("No matching orders found");
        return Ok(());
    }

    let market = &mut ctx.accounts.market;
    let clock = Clock::get()?;

    // Update market stats
    market.active_bids = market.active_bids.saturating_sub(1);
    market.active_asks = market.active_asks.saturating_sub(1);

    // Note: In production, this callback would:
    // 1. Create the settlement account with maker/taker pubkeys from MatchResult
    // 2. Update maker/taker positions
    // The MatchResult contains maker_lo, maker_hi, taker_lo, taker_hi
    // which can be reconstructed to full Pubkeys

    emit!(OrdersMatched {
        market: market.key(),
        maker: Pubkey::default(), // Would be reconstructed from maker_lo/maker_hi
        taker: Pubkey::default(), // Would be reconstructed from taker_lo/taker_hi
        maker_order_id,
        taker_order_id,
        execution_price,
        execution_amount,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Orders matched! Price: {}, Amount: {}",
        execution_price,
        execution_amount
    );

    Ok(())
}
