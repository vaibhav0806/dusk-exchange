use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::Market;
use crate::events::MarketCreated;

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Market::LEN,
        seeds = [Market::SEED_PREFIX, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    /// Base token mint (e.g., wSOL)
    pub base_mint: Account<'info, Mint>,

    /// Quote token mint (e.g., USDC)
    pub quote_mint: Account<'info, Mint>,

    /// Vault for base tokens
    #[account(
        init,
        payer = authority,
        token::mint = base_mint,
        token::authority = market,
        seeds = [b"base_vault", market.key().as_ref()],
        bump
    )]
    pub base_vault: Account<'info, TokenAccount>,

    /// Vault for quote tokens
    #[account(
        init,
        payer = authority,
        token::mint = quote_mint,
        token::authority = market,
        seeds = [b"quote_vault", market.key().as_ref()],
        bump
    )]
    pub quote_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeMarket>,
    market_id: u64,
    fee_rate_bps: u16,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    market.authority = ctx.accounts.authority.key();
    market.base_mint = ctx.accounts.base_mint.key();
    market.quote_mint = ctx.accounts.quote_mint.key();
    market.base_vault = ctx.accounts.base_vault.key();
    market.quote_vault = ctx.accounts.quote_vault.key();
    market.market_id = market_id;
    market.fee_rate_bps = fee_rate_bps;
    market.order_count = 0;
    market.orderbook_ref = Pubkey::default(); // Set after MXE initialization
    market.base_locked = 0;
    market.quote_locked = 0;
    market.active_bids = 0;
    market.active_asks = 0;
    market.bump = ctx.bumps.market;

    emit!(MarketCreated {
        market: market.key(),
        market_id,
        base_mint: market.base_mint,
        quote_mint: market.quote_mint,
        authority: market.authority,
        fee_rate_bps,
    });

    msg!("Market {} initialized: {}/{}",
        market_id,
        ctx.accounts.base_mint.key(),
        ctx.accounts.quote_mint.key()
    );

    Ok(())
}
