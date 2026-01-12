use anchor_lang::prelude::*;

use crate::state::{Market, TradeSettlement};
use crate::errors::DuskError;

/// Create a settlement account from pending match data stored in market
#[derive(Accounts)]
pub struct CreateSettlement<'info> {
    /// Anyone can create the settlement (keeper, maker, taker, etc.)
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        constraint = market.has_pending_match @ DuskError::NoMatchingOrders
    )]
    pub market: Account<'info, Market>,

    /// Settlement account to be created
    /// Uses settlement_count + 1 as the settlement ID
    #[account(
        init,
        payer = payer,
        space = TradeSettlement::LEN,
        seeds = [
            TradeSettlement::SEED_PREFIX,
            market.key().as_ref(),
            (market.settlement_count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub settlement: Account<'info, TradeSettlement>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateSettlement>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let settlement = &mut ctx.accounts.settlement;

    // Increment settlement count
    market.settlement_count = market.settlement_count.saturating_add(1);
    let settlement_id = market.settlement_count;

    // Initialize the settlement account from pending match data
    settlement.market = market.key();
    settlement.maker = market.pending_maker;
    settlement.taker = market.pending_taker;
    settlement.maker_order_id = market.pending_maker_order_id;
    settlement.taker_order_id = market.pending_taker_order_id;
    settlement.execution_price = market.pending_execution_price;
    settlement.execution_amount = market.pending_execution_amount;
    // Maker is always the ask (seller) in our circuit design
    settlement.maker_is_buy = false;
    settlement.settled = false;
    settlement.matched_at = market.pending_matched_at;
    settlement.settled_at = 0;
    settlement.bump = ctx.bumps.settlement;

    // Clear pending match data
    market.has_pending_match = false;
    market.pending_maker = Pubkey::default();
    market.pending_taker = Pubkey::default();
    market.pending_maker_order_id = 0;
    market.pending_taker_order_id = 0;
    market.pending_execution_price = 0;
    market.pending_execution_amount = 0;
    market.pending_matched_at = 0;

    msg!(
        "Settlement {} created: {} base @ {} price. Maker: {}, Taker: {}",
        settlement_id,
        settlement.execution_amount,
        settlement.execution_price,
        settlement.maker,
        settlement.taker
    );

    Ok(())
}
