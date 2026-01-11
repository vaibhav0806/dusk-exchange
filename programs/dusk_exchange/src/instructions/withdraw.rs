use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{Market, UserPosition};
use crate::events::Withdrawn;
use crate::errors::DuskError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
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

    /// User's token account to withdraw to
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Market vault to withdraw from (base or quote)
    #[account(
        mut,
        constraint = vault.key() == market.base_vault || vault.key() == market.quote_vault
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Withdraw>, amount: u64, is_base: bool) -> Result<()> {
    require!(amount > 0, DuskError::AmountTooSmall);

    let user_position = &mut ctx.accounts.user_position;
    let market = &ctx.accounts.market;

    // Verify correct vault
    let expected_vault = if is_base {
        market.base_vault
    } else {
        market.quote_vault
    };
    require!(
        ctx.accounts.vault.key() == expected_vault,
        DuskError::InvalidMarketConfig
    );

    // Check available balance (not locked in orders)
    let available = if is_base {
        user_position.base_available()
    } else {
        user_position.quote_available()
    };
    require!(available >= amount, DuskError::InsufficientBalance);

    // Transfer tokens from vault to user using market PDA authority
    let market_id_bytes = market.market_id.to_le_bytes();
    let market_seeds = &[
        Market::SEED_PREFIX,
        market_id_bytes.as_ref(),
        &[market.bump],
    ];
    let signer_seeds = &[&market_seeds[..]];

    let transfer_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: market.to_account_info(),
    };

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        ),
        amount,
    )?;

    // Update user position
    if is_base {
        user_position.base_deposited = user_position
            .base_deposited
            .checked_sub(amount)
            .ok_or(DuskError::MathOverflow)?;
    } else {
        user_position.quote_deposited = user_position
            .quote_deposited
            .checked_sub(amount)
            .ok_or(DuskError::MathOverflow)?;
    }

    emit!(Withdrawn {
        market: market.key(),
        user: ctx.accounts.user.key(),
        amount,
        is_base,
    });

    msg!(
        "Withdrawn {} {} tokens from market {}",
        amount,
        if is_base { "base" } else { "quote" },
        market.market_id
    );

    Ok(())
}
