use anchor_lang::prelude::*;

use crate::state::{Market, UserPosition, TradeSettlement};
use crate::events::OrdersMatched;
use crate::errors::DuskError;

/// Trigger order matching via MPC
#[derive(Accounts)]
pub struct MatchOrders<'info> {
    /// Anyone can trigger matching (keeper, user, etc.)
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: MXE computation account for queuing
    #[account(mut)]
    pub computation: AccountInfo<'info>,

    /// CHECK: Arcium MXE account
    pub mxe: AccountInfo<'info>,

    /// CHECK: Arcium mempool
    #[account(mut)]
    pub mempool: AccountInfo<'info>,

    /// CHECK: Arcium program
    pub arcium_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MatchOrders>) -> Result<()> {
    let market = &ctx.accounts.market;

    // Require at least one bid and one ask to attempt matching
    require!(
        market.active_bids > 0 && market.active_asks > 0,
        DuskError::NoMatchingOrders
    );

    // Queue computation to find matching orders
    // The MPC will:
    // 1. Scan bids (highest price first)
    // 2. Scan asks (lowest price first)
    // 3. Find crossing orders (bid.price >= ask.price)
    // 4. Return revealed execution details

    // TODO: Implement arcium queue_computation CPI
    // queue_computation!(
    //     ctx.accounts.caller,
    //     ctx.accounts.computation,
    //     ctx.accounts.mxe,
    //     ctx.accounts.mempool,
    //     ctx.accounts.arcium_program,
    //     MATCH_BOOK_COMP_DEF_OFFSET
    // )?;

    msg!(
        "Match orders requested on market {} ({} bids, {} asks)",
        market.market_id,
        market.active_bids,
        market.active_asks
    );

    Ok(())
}

/// Callback for match_orders computation
/// Receives revealed execution details
/// Note: Settlement account creation moved to separate instruction for simplicity
#[derive(Accounts)]
pub struct MatchOrdersCallback<'info> {
    /// CHECK: Arcium callback authority
    #[account(mut)]
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    pub system_program: Program<'info, System>,
}

pub fn callback_handler(
    ctx: Context<MatchOrdersCallback>,
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
    // 1. Create the settlement account
    // 2. Update maker/taker positions
    // For now, we just log the match result

    emit!(OrdersMatched {
        market: market.key(),
        maker: Pubkey::default(), // Would come from MPC result
        taker: Pubkey::default(), // Would come from MPC result
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
