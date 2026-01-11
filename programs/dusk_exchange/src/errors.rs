use anchor_lang::prelude::*;

#[error_code]
pub enum DuskError {
    #[msg("Insufficient balance for this operation")]
    InsufficientBalance,

    #[msg("Math overflow occurred")]
    MathOverflow,

    #[msg("Too many active orders")]
    TooManyOrders,

    #[msg("Order not found")]
    OrderNotFound,

    #[msg("Invalid order parameters")]
    InvalidOrderParams,

    #[msg("Order already cancelled")]
    OrderAlreadyCancelled,

    #[msg("Trade already settled")]
    TradeAlreadySettled,

    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Market is paused")]
    MarketPaused,

    #[msg("Invalid market configuration")]
    InvalidMarketConfig,

    #[msg("Orderbook is full")]
    OrderbookFull,

    #[msg("No matching orders found")]
    NoMatchingOrders,

    #[msg("Self-trade prevention")]
    SelfTrade,

    #[msg("Price out of valid range")]
    InvalidPrice,

    #[msg("Amount below minimum")]
    AmountTooSmall,

    #[msg("Computation not ready")]
    ComputationNotReady,

    #[msg("Invalid encrypted data")]
    InvalidEncryptedData,

    #[msg("Arcium computation failed")]
    ArciumComputationFailed,
}
