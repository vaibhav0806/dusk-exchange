//! Encrypted instructions for Dusk Exchange
//!
//! This module contains the Arcis MPC circuits for:
//! - add_order: Insert an encrypted order into the orderbook
//! - remove_order: Remove an order by ID
//! - match_book: Find and match crossing orders
//!
//! Built using Arcium's Arcis framework for confidential computation.

use arcis_imports::*;

/// Maximum number of orders in the orderbook
/// Keep this reasonable to limit MPC computation time
pub const MAX_ORDERS: usize = 32;

/// Price scaling factor (10^6 = 1 dollar)
/// e.g., $100.50 = 100_500_000
pub const PRICE_SCALE: u64 = 1_000_000;

#[encrypted]
mod orderbook {
    use super::*;

    /// Represents a single order in the encrypted orderbook
    /// Pubkeys are split into two u128 since Arcis encrypts primitives individually
    #[derive(Copy, Clone, Default)]
    pub struct Order {
        /// Price in scaled units (price * PRICE_SCALE)
        pub price: u64,
        /// Amount in base token units
        pub amount: u64,
        /// Lower 128 bits of owner pubkey
        pub owner_lo: u128,
        /// Upper 128 bits of owner pubkey
        pub owner_hi: u128,
        /// Unique order identifier
        pub order_id: u64,
        /// true = buy order, false = sell order
        pub side: bool,
        /// Whether this order slot is active
        pub is_active: bool,
    }

    /// The encrypted orderbook state
    #[derive(Copy, Clone, Default)]
    pub struct OrderBookState {
        /// Best bid price (highest buy price)
        pub best_bid_price: u64,
        /// Best bid amount
        pub best_bid_amount: u64,
        /// Best bid owner (lower bits)
        pub best_bid_owner_lo: u128,
        /// Best bid owner (upper bits)
        pub best_bid_owner_hi: u128,
        /// Best bid order ID
        pub best_bid_id: u64,

        /// Best ask price (lowest sell price)
        pub best_ask_price: u64,
        /// Best ask amount
        pub best_ask_amount: u64,
        /// Best ask owner (lower bits)
        pub best_ask_owner_lo: u128,
        /// Best ask owner (upper bits)
        pub best_ask_owner_hi: u128,
        /// Best ask order ID
        pub best_ask_id: u64,

        /// Total number of active orders
        pub order_count: u64,

        /// State nonce for tracking updates
        pub nonce: u64,
    }

    /// Result of a match operation - these fields are revealed
    #[derive(Copy, Clone, Default)]
    pub struct MatchResult {
        /// Whether a match was found
        pub matched: bool,
        /// Maker order ID (the resting order)
        pub maker_order_id: u64,
        /// Taker order ID (the crossing order)
        pub taker_order_id: u64,
        /// Execution price (revealed)
        pub execution_price: u64,
        /// Execution amount (revealed)
        pub execution_amount: u64,
        /// Maker pubkey lower bits
        pub maker_lo: u128,
        /// Maker pubkey upper bits
        pub maker_hi: u128,
        /// Taker pubkey lower bits
        pub taker_lo: u128,
        /// Taker pubkey upper bits
        pub taker_hi: u128,
        /// Whether maker was buying
        pub maker_is_buy: bool,
    }

    /// Initialize an empty orderbook state
    #[instruction]
    pub fn init_orderbook_state() -> Enc<Mxe, OrderBookState> {
        let state = OrderBookState {
            best_bid_price: 0,
            best_bid_amount: 0,
            best_bid_owner_lo: 0,
            best_bid_owner_hi: 0,
            best_bid_id: 0,
            best_ask_price: u64::MAX, // Very high so any ask is better
            best_ask_amount: 0,
            best_ask_owner_lo: 0,
            best_ask_owner_hi: 0,
            best_ask_id: 0,
            order_count: 0,
            nonce: 0,
        };
        Enc::<Mxe, OrderBookState>::from_arcis(state)
    }

    /// Add a new order to the orderbook
    /// Updates best bid/ask if the new order is better
    #[instruction]
    pub fn add_order(
        order: Enc<Shared, Order>,
        state_ctxt: Enc<Mxe, &OrderBookState>,
    ) -> Enc<Mxe, OrderBookState> {
        let new_order = order.to_arcis();
        let mut state = state_ctxt.to_arcis();

        // Only process active orders
        if new_order.is_active {
            if new_order.side {
                // Buy order - check if it's the best bid (highest price)
                if new_order.price > state.best_bid_price {
                    state.best_bid_price = new_order.price;
                    state.best_bid_amount = new_order.amount;
                    state.best_bid_owner_lo = new_order.owner_lo;
                    state.best_bid_owner_hi = new_order.owner_hi;
                    state.best_bid_id = new_order.order_id;
                }
            } else {
                // Sell order - check if it's the best ask (lowest price)
                if new_order.price < state.best_ask_price {
                    state.best_ask_price = new_order.price;
                    state.best_ask_amount = new_order.amount;
                    state.best_ask_owner_lo = new_order.owner_lo;
                    state.best_ask_owner_hi = new_order.owner_hi;
                    state.best_ask_id = new_order.order_id;
                }
            }
            state.order_count += 1;
            state.nonce += 1;
        }

        state_ctxt.owner.from_arcis(state)
    }

    /// Remove an order from the orderbook by ID
    /// Note: In a full implementation, we'd need to track all orders
    /// For MVP, we only track best bid/ask
    #[instruction]
    pub fn remove_order(
        order_id: u64,
        owner_lo: u128,
        owner_hi: u128,
        state_ctxt: Enc<Mxe, &OrderBookState>,
    ) -> Enc<Mxe, OrderBookState> {
        let mut state = state_ctxt.to_arcis();

        // Check if removing best bid
        if state.best_bid_id == order_id
            && state.best_bid_owner_lo == owner_lo
            && state.best_bid_owner_hi == owner_hi
        {
            state.best_bid_price = 0;
            state.best_bid_amount = 0;
            state.best_bid_owner_lo = 0;
            state.best_bid_owner_hi = 0;
            state.best_bid_id = 0;
            state.order_count = state.order_count.saturating_sub(1);
            state.nonce += 1;
        }

        // Check if removing best ask
        if state.best_ask_id == order_id
            && state.best_ask_owner_lo == owner_lo
            && state.best_ask_owner_hi == owner_hi
        {
            state.best_ask_price = u64::MAX;
            state.best_ask_amount = 0;
            state.best_ask_owner_lo = 0;
            state.best_ask_owner_hi = 0;
            state.best_ask_id = 0;
            state.order_count = state.order_count.saturating_sub(1);
            state.nonce += 1;
        }

        state_ctxt.owner.from_arcis(state)
    }

    /// Match orders in the orderbook
    /// If best_bid.price >= best_ask.price, a match is found
    /// Returns revealed execution details
    #[instruction]
    pub fn match_book(
        state_ctxt: Enc<Mxe, &OrderBookState>,
    ) -> (Enc<Mxe, OrderBookState>, MatchResult) {
        let mut state = state_ctxt.to_arcis();
        let mut result = MatchResult::default();

        // Check for crossing orders (bid.price >= ask.price)
        let has_match = state.best_bid_price >= state.best_ask_price
            && state.best_bid_amount > 0
            && state.best_ask_amount > 0;

        // Self-trade prevention
        let is_self_trade = state.best_bid_owner_lo == state.best_ask_owner_lo
            && state.best_bid_owner_hi == state.best_ask_owner_hi;

        if has_match && !is_self_trade {
            // Calculate execution price (midpoint)
            let execution_price = (state.best_bid_price + state.best_ask_price) / 2;

            // Calculate execution amount (minimum of both)
            let execution_amount = if state.best_bid_amount < state.best_ask_amount {
                state.best_bid_amount
            } else {
                state.best_ask_amount
            };

            // Populate result (these will be revealed)
            result.matched = true;
            result.maker_order_id = state.best_ask_id; // Ask was resting (maker)
            result.taker_order_id = state.best_bid_id; // Bid crossed (taker)
            result.execution_price = execution_price;
            result.execution_amount = execution_amount;
            result.maker_lo = state.best_ask_owner_lo;
            result.maker_hi = state.best_ask_owner_hi;
            result.taker_lo = state.best_bid_owner_lo;
            result.taker_hi = state.best_bid_owner_hi;
            result.maker_is_buy = false; // Maker was selling

            // Update state - reduce amounts or clear if fully filled
            if state.best_bid_amount <= execution_amount {
                // Bid fully filled
                state.best_bid_price = 0;
                state.best_bid_amount = 0;
                state.best_bid_owner_lo = 0;
                state.best_bid_owner_hi = 0;
                state.best_bid_id = 0;
            } else {
                state.best_bid_amount -= execution_amount;
            }

            if state.best_ask_amount <= execution_amount {
                // Ask fully filled
                state.best_ask_price = u64::MAX;
                state.best_ask_amount = 0;
                state.best_ask_owner_lo = 0;
                state.best_ask_owner_hi = 0;
                state.best_ask_id = 0;
            } else {
                state.best_ask_amount -= execution_amount;
            }

            state.nonce += 1;
        }

        (state_ctxt.owner.from_arcis(state), result.reveal())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constants() {
        assert_eq!(MAX_ORDERS, 32);
        assert_eq!(PRICE_SCALE, 1_000_000);
    }
}
