use anchor_lang::prelude::*;

use crate::state::{Market, UserPosition};
use crate::events::OrderCancelled;
use crate::errors::DuskError;

/// Cancel an existing order
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

pub fn handler(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
    let market = &ctx.accounts.market;

    require!(
        ctx.accounts.user_position.active_order_count > 0,
        DuskError::OrderNotFound
    );

    // Queue computation to remove order from encrypted orderbook
    // TODO: Implement arcium queue_computation CPI
    // queue_computation!(
    //     ctx.accounts.user,
    //     ctx.accounts.computation,
    //     ctx.accounts.mxe,
    //     ctx.accounts.mempool,
    //     ctx.accounts.arcium_program,
    //     REMOVE_ORDER_COMP_DEF_OFFSET,
    //     order_id,
    //     ctx.accounts.user.key()
    // )?;

    msg!(
        "Cancel order {} requested on market {}",
        order_id,
        market.market_id
    );

    Ok(())
}

/// Callback for cancel_order computation
#[derive(Accounts)]
pub struct CancelOrderCallback<'info> {
    /// CHECK: Arcium callback authority
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: User who cancelled the order
    pub user: AccountInfo<'info>,

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

pub fn callback_handler(ctx: Context<CancelOrderCallback>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_position = &mut ctx.accounts.user_position;

    // Decrement active order count
    user_position.active_order_count = user_position
        .active_order_count
        .saturating_sub(1);

    // Note: We don't know if it was a buy or sell order from here
    // In production, the callback would include this info
    // For now, we emit the event

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
