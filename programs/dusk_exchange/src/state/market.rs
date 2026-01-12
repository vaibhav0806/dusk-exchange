use anchor_lang::prelude::*;

/// Market account representing a trading pair (e.g., SOL/USDC)
/// Seeds: ["market", market_id]
#[account]
#[derive(Default)]
pub struct Market {
    /// Authority that can modify market parameters
    pub authority: Pubkey,

    /// Base token mint (e.g., wSOL)
    pub base_mint: Pubkey,

    /// Quote token mint (e.g., USDC)
    pub quote_mint: Pubkey,

    /// Token vault for base tokens
    pub base_vault: Pubkey,

    /// Token vault for quote tokens
    pub quote_vault: Pubkey,

    /// Unique market identifier
    pub market_id: u64,

    /// Trading fee in basis points (100 = 1%)
    pub fee_rate_bps: u16,

    /// Counter for generating unique order IDs
    pub order_count: u64,

    /// Reference to the encrypted orderbook (MXE-managed)
    pub orderbook_ref: Pubkey,

    /// Total base tokens locked in open orders
    pub base_locked: u64,

    /// Total quote tokens locked in open orders
    pub quote_locked: u64,

    /// Number of active buy orders
    pub active_bids: u32,

    /// Number of active sell orders
    pub active_asks: u32,

    /// Counter for generating unique settlement IDs
    pub settlement_count: u64,

    /// Pending match - maker pubkey (from last match, needs settlement creation)
    pub pending_maker: Pubkey,

    /// Pending match - taker pubkey
    pub pending_taker: Pubkey,

    /// Pending match - maker order ID
    pub pending_maker_order_id: u64,

    /// Pending match - taker order ID
    pub pending_taker_order_id: u64,

    /// Pending match - execution price
    pub pending_execution_price: u64,

    /// Pending match - execution amount
    pub pending_execution_amount: u64,

    /// Pending match - timestamp
    pub pending_matched_at: i64,

    /// Whether there's a pending match that needs settlement creation
    pub has_pending_match: bool,

    /// PDA bump seed
    pub bump: u8,
}

impl Market {
    pub const LEN: usize = 8 +  // discriminator
        32 +  // authority
        32 +  // base_mint
        32 +  // quote_mint
        32 +  // base_vault
        32 +  // quote_vault
        8 +   // market_id
        2 +   // fee_rate_bps
        8 +   // order_count
        32 +  // orderbook_ref
        8 +   // base_locked
        8 +   // quote_locked
        4 +   // active_bids
        4 +   // active_asks
        8 +   // settlement_count
        32 +  // pending_maker
        32 +  // pending_taker
        8 +   // pending_maker_order_id
        8 +   // pending_taker_order_id
        8 +   // pending_execution_price
        8 +   // pending_execution_amount
        8 +   // pending_matched_at
        1 +   // has_pending_match
        1;    // bump

    pub const SEED_PREFIX: &'static [u8] = b"market";

    /// Calculate fee amount for a given trade amount
    pub fn calculate_fee(&self, amount: u64) -> u64 {
        (amount as u128 * self.fee_rate_bps as u128 / 10_000) as u64
    }

    /// Generate next order ID
    pub fn next_order_id(&mut self) -> u64 {
        self.order_count += 1;
        self.order_count
    }
}

/// Seeds for deriving market PDA
pub fn market_seeds(market_id: u64) -> [Vec<u8>; 2] {
    [
        Market::SEED_PREFIX.to_vec(),
        market_id.to_le_bytes().to_vec(),
    ]
}
