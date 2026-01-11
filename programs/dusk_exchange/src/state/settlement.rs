use anchor_lang::prelude::*;

/// Trade settlement account created when orders are matched
/// Contains revealed execution details
/// Seeds: ["settlement", market, maker_order_id, taker_order_id]
#[account]
#[derive(Default)]
pub struct TradeSettlement {
    /// Market where the trade occurred
    pub market: Pubkey,

    /// Maker (limit order that was resting)
    pub maker: Pubkey,

    /// Taker (order that crossed the spread)
    pub taker: Pubkey,

    /// Maker's order ID
    pub maker_order_id: u64,

    /// Taker's order ID
    pub taker_order_id: u64,

    /// Revealed execution price (scaled by 10^6)
    pub execution_price: u64,

    /// Revealed execution amount (base tokens)
    pub execution_amount: u64,

    /// Whether maker was buying (true) or selling (false)
    pub maker_is_buy: bool,

    /// Whether this trade has been settled
    pub settled: bool,

    /// Timestamp of the match
    pub matched_at: i64,

    /// Timestamp of settlement (0 if not settled)
    pub settled_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl TradeSettlement {
    pub const LEN: usize = 8 +  // discriminator
        32 +  // market
        32 +  // maker
        32 +  // taker
        8 +   // maker_order_id
        8 +   // taker_order_id
        8 +   // execution_price
        8 +   // execution_amount
        1 +   // maker_is_buy
        1 +   // settled
        8 +   // matched_at
        8 +   // settled_at
        1;    // bump

    pub const SEED_PREFIX: &'static [u8] = b"settlement";

    /// Calculate quote amount from price and base amount
    /// price is scaled by 10^6 (e.g., $100 = 100_000_000)
    pub fn calculate_quote_amount(&self) -> u64 {
        // quote = base * price / 10^6
        ((self.execution_amount as u128 * self.execution_price as u128) / 1_000_000) as u64
    }
}

/// Seeds for deriving settlement PDA
pub fn settlement_seeds(
    market: &Pubkey,
    maker_order_id: u64,
    taker_order_id: u64,
) -> [Vec<u8>; 4] {
    [
        TradeSettlement::SEED_PREFIX.to_vec(),
        market.as_ref().to_vec(),
        maker_order_id.to_le_bytes().to_vec(),
        taker_order_id.to_le_bytes().to_vec(),
    ]
}
