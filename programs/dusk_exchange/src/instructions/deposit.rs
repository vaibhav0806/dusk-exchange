use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{Market, UserPosition};
use crate::events::Deposited;
use crate::errors::DuskError;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer = user,
        space = UserPosition::LEN,
        seeds = [
            UserPosition::SEED_PREFIX,
            market.key().as_ref(),
            user.key().as_ref()
        ],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    /// User's token account to deposit from
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Market vault to deposit into (base or quote)
    #[account(
        mut,
        constraint = vault.key() == market.base_vault || vault.key() == market.quote_vault
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64, is_base: bool) -> Result<()> {
    require!(amount > 0, DuskError::AmountTooSmall);

    let user_position = &mut ctx.accounts.user_position;
    let market = &ctx.accounts.market;

    // Initialize user position if new
    if user_position.owner == Pubkey::default() {
        user_position.owner = ctx.accounts.user.key();
        user_position.market = market.key();
        user_position.bump = ctx.bumps.user_position;
    }

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

    // Transfer tokens from user to vault
    let transfer_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
        ),
        amount,
    )?;

    // Update user position
    if is_base {
        user_position.base_deposited = user_position
            .base_deposited
            .checked_add(amount)
            .ok_or(DuskError::MathOverflow)?;
    } else {
        user_position.quote_deposited = user_position
            .quote_deposited
            .checked_add(amount)
            .ok_or(DuskError::MathOverflow)?;
    }

    emit!(Deposited {
        market: market.key(),
        user: ctx.accounts.user.key(),
        amount,
        is_base,
    });

    msg!(
        "Deposited {} {} tokens to market {}",
        amount,
        if is_base { "base" } else { "quote" },
        market.market_id
    );

    Ok(())
}
