use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{Market, UserPosition, TradeSettlement};
use crate::events::TradeSettled;
use crate::errors::DuskError;

/// Settle a matched trade by transferring tokens
#[derive(Accounts)]
pub struct SettleTrade<'info> {
    /// Anyone can settle (usually maker, taker, or keeper)
    pub caller: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        constraint = settlement.market == market.key() @ DuskError::InvalidMarketConfig,
        constraint = !settlement.settled @ DuskError::TradeAlreadySettled
    )]
    pub settlement: Account<'info, TradeSettlement>,

    #[account(
        mut,
        seeds = [
            UserPosition::SEED_PREFIX,
            market.key().as_ref(),
            settlement.maker.as_ref()
        ],
        bump
    )]
    pub maker_position: Account<'info, UserPosition>,

    #[account(
        mut,
        seeds = [
            UserPosition::SEED_PREFIX,
            market.key().as_ref(),
            settlement.taker.as_ref()
        ],
        bump
    )]
    pub taker_position: Account<'info, UserPosition>,

    /// Base token vault
    #[account(
        mut,
        constraint = base_vault.key() == market.base_vault
    )]
    pub base_vault: Account<'info, TokenAccount>,

    /// Quote token vault
    #[account(
        mut,
        constraint = quote_vault.key() == market.quote_vault
    )]
    pub quote_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<SettleTrade>) -> Result<()> {
    let settlement = &mut ctx.accounts.settlement;
    let market = &ctx.accounts.market;
    let maker_position = &mut ctx.accounts.maker_position;
    let taker_position = &mut ctx.accounts.taker_position;

    let base_amount = settlement.execution_amount;
    let quote_amount = settlement.calculate_quote_amount();

    // Determine who is buying and who is selling
    // maker_is_buy: if true, maker was buying (so taker is selling)
    let (buyer_position, seller_position) = if settlement.maker_is_buy {
        (maker_position, taker_position)
    } else {
        (taker_position, maker_position)
    };

    // Verify seller has enough base tokens
    require!(
        seller_position.base_deposited >= base_amount,
        DuskError::InsufficientBalance
    );

    // Verify buyer has enough quote tokens
    require!(
        buyer_position.quote_deposited >= quote_amount,
        DuskError::InsufficientBalance
    );

    // Calculate fee
    let fee = market.calculate_fee(quote_amount);
    let quote_after_fee = quote_amount.saturating_sub(fee);

    // Update balances
    // Seller: loses base, gains quote
    seller_position.base_deposited = seller_position
        .base_deposited
        .checked_sub(base_amount)
        .ok_or(DuskError::MathOverflow)?;
    seller_position.base_locked = seller_position
        .base_locked
        .saturating_sub(base_amount);
    seller_position.quote_deposited = seller_position
        .quote_deposited
        .checked_add(quote_after_fee)
        .ok_or(DuskError::MathOverflow)?;

    // Buyer: loses quote, gains base
    buyer_position.quote_deposited = buyer_position
        .quote_deposited
        .checked_sub(quote_amount)
        .ok_or(DuskError::MathOverflow)?;
    buyer_position.quote_locked = buyer_position
        .quote_locked
        .saturating_sub(quote_amount);
    buyer_position.base_deposited = buyer_position
        .base_deposited
        .checked_add(base_amount)
        .ok_or(DuskError::MathOverflow)?;

    // Mark settlement as complete
    settlement.settled = true;
    settlement.settled_at = Clock::get()?.unix_timestamp;

    emit!(TradeSettled {
        market: market.key(),
        settlement: settlement.key(),
        maker: settlement.maker,
        taker: settlement.taker,
        base_transferred: base_amount,
        quote_transferred: quote_amount,
    });

    msg!(
        "Trade settled: {} base for {} quote (fee: {})",
        base_amount,
        quote_amount,
        fee
    );

    Ok(())
}
