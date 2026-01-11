use anchor_lang::prelude::*;

/// Emitted when a new market is created
#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub market_id: u64,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub authority: Pubkey,
    pub fee_rate_bps: u16,
}

/// Emitted when tokens are deposited
#[event]
pub struct Deposited {
    pub market: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub is_base: bool,
}

/// Emitted when tokens are withdrawn
#[event]
pub struct Withdrawn {
    pub market: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub is_base: bool,
}

/// Emitted when an order is placed
/// Note: Price and amount are NOT included (encrypted)
#[event]
pub struct OrderPlaced {
    pub market: Pubkey,
    pub user: Pubkey,
    pub order_id: u64,
    pub is_buy: bool,
    /// Timestamp when order was submitted
    pub timestamp: i64,
}

/// Emitted when an order is cancelled
#[event]
pub struct OrderCancelled {
    pub market: Pubkey,
    pub user: Pubkey,
    pub order_id: u64,
}

/// Emitted when orders are matched
/// This reveals execution details after the match
#[event]
pub struct OrdersMatched {
    pub market: Pubkey,
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub maker_order_id: u64,
    pub taker_order_id: u64,
    /// Revealed execution price (scaled by 10^6)
    pub execution_price: u64,
    /// Revealed execution amount (base tokens)
    pub execution_amount: u64,
    pub timestamp: i64,
}

/// Emitted when a trade is settled
#[event]
pub struct TradeSettled {
    pub market: Pubkey,
    pub settlement: Pubkey,
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub base_transferred: u64,
    pub quote_transferred: u64,
}
