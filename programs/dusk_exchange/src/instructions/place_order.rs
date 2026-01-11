use anchor_lang::prelude::*;

use crate::state::{Market, UserPosition};
use crate::events::OrderPlaced;
use crate::errors::DuskError;

/// Place an encrypted limit order
#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct PlaceOrder<'info> {
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

pub fn handler(
    ctx: Context<PlaceOrder>,
    order_id: u64,
    is_buy: bool,
    encrypted_price: Vec<u8>,
    encrypted_amount: Vec<u8>,
    _nonce: [u8; 12],
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_position = &mut ctx.accounts.user_position;

    // Validate encrypted data lengths
    require!(
        encrypted_price.len() == 16 && encrypted_amount.len() == 16,
        DuskError::InvalidEncryptedData
    );

    // For now, we need to estimate the locked amount
    // In production, this would be validated in the MPC callback
    // The user should provide a max_amount they're willing to lock
    // For MVP, we'll require pre-deposited funds

    // Update market order count
    market.order_count = market.order_count.saturating_add(1);

    // Update active orders count
    if is_buy {
        market.active_bids = market.active_bids.saturating_add(1);
    } else {
        market.active_asks = market.active_asks.saturating_add(1);
    }

    user_position.active_order_count = user_position
        .active_order_count
        .saturating_add(1);

    // Queue computation to add order to encrypted orderbook
    // TODO: Implement arcium queue_computation CPI
    // queue_computation!(
    //     ctx.accounts.user,
    //     ctx.accounts.computation,
    //     ctx.accounts.mxe,
    //     ctx.accounts.mempool,
    //     ctx.accounts.arcium_program,
    //     ADD_ORDER_COMP_DEF_OFFSET,
    //     encrypted_price,
    //     encrypted_amount,
    //     order_id,
    //     is_buy,
    //     ctx.accounts.user.key(),
    //     nonce
    // )?;

    let clock = Clock::get()?;

    emit!(OrderPlaced {
        market: market.key(),
        user: ctx.accounts.user.key(),
        order_id,
        is_buy,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Order {} placed: {} order on market {}",
        order_id,
        if is_buy { "BUY" } else { "SELL" },
        market.market_id
    );

    Ok(())
}

/// Callback for place_order computation
#[derive(Accounts)]
pub struct PlaceOrderCallback<'info> {
    /// CHECK: Arcium callback authority
    pub callback_authority: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: User who placed the order
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

pub fn callback_handler(ctx: Context<PlaceOrderCallback>) -> Result<()> {
    // Callback from Arcium after order is added to encrypted orderbook
    // The actual order data is stored encrypted in the MXE

    msg!(
        "Order placed callback received for user {} on market {}",
        ctx.accounts.user.key(),
        ctx.accounts.market.market_id
    );

    Ok(())
}
