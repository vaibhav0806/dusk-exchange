//! Encrypted instructions for Dusk Exchange
//!
//! This module contains the Arcis MPC circuits for:
//! - add_order: Insert an encrypted order, update best bid/ask
//! - match_book: Find and match crossing orders
//!
//! Built using Arcium's Arcis framework for confidential computation.

use arcis_imports::*;

#[encrypted]
mod orderbook {
    use arcis_imports::*;

    /// Represents a single order
    #[derive(Copy, Clone)]
    pub struct Order {
        pub price: u64,
        pub amount: u64,
        pub owner_lo: u128,
        pub owner_hi: u128,
        pub order_id: u64,
        pub side: bool, // true = buy, false = sell
    }

    /// The encrypted orderbook state - tracks best bid and ask
    #[derive(Copy, Clone)]
    pub struct OrderBookState {
        pub best_bid_price: u64,
        pub best_bid_amount: u64,
        pub best_bid_owner_lo: u128,
        pub best_bid_owner_hi: u128,
        pub best_bid_id: u64,

        pub best_ask_price: u64,
        pub best_ask_amount: u64,
        pub best_ask_owner_lo: u128,
        pub best_ask_owner_hi: u128,
        pub best_ask_id: u64,

        pub order_count: u64,
    }

    /// Result of a match operation - revealed after computation
    #[derive(Copy, Clone)]
    pub struct MatchResult {
        pub matched: bool,
        pub maker_order_id: u64,
        pub taker_order_id: u64,
        pub execution_price: u64,
        pub execution_amount: u64,
        pub maker_lo: u128,
        pub maker_hi: u128,
        pub taker_lo: u128,
        pub taker_hi: u128,
    }

    /// Add a new order to the orderbook
    /// Updates best bid/ask if the new order is better
    #[instruction]
    pub fn add_order(
        order: Enc<Shared, Order>,
        state_ctxt: Enc<Mxe, OrderBookState>,
    ) -> Enc<Mxe, OrderBookState> {
        let new_order = order.to_arcis();
        let mut state = state_ctxt.to_arcis();

        if new_order.side {
            // Buy order - update if better (higher price)
            if new_order.price > state.best_bid_price {
                state.best_bid_price = new_order.price;
                state.best_bid_amount = new_order.amount;
                state.best_bid_owner_lo = new_order.owner_lo;
                state.best_bid_owner_hi = new_order.owner_hi;
                state.best_bid_id = new_order.order_id;
            }
        } else {
            // Sell order - update if better (lower price)
            // Note: For initial state, best_ask_price should be very high
            if new_order.price < state.best_ask_price {
                state.best_ask_price = new_order.price;
                state.best_ask_amount = new_order.amount;
                state.best_ask_owner_lo = new_order.owner_lo;
                state.best_ask_owner_hi = new_order.owner_hi;
                state.best_ask_id = new_order.order_id;
            }
        }
        state.order_count = state.order_count + 1;

        state_ctxt.owner.from_arcis(state)
    }

    /// Remove/cancel an order from the orderbook
    /// Only the order owner can cancel their order
    #[instruction]
    pub fn remove_order(
        order_id: Enc<Shared, u64>,
        owner_lo: Enc<Shared, u128>,
        owner_hi: Enc<Shared, u128>,
        state_ctxt: Enc<Mxe, OrderBookState>,
    ) -> (Enc<Mxe, OrderBookState>, bool) {
        let target_id = order_id.to_arcis();
        let target_owner_lo = owner_lo.to_arcis();
        let target_owner_hi = owner_hi.to_arcis();
        let mut state = state_ctxt.to_arcis();
        let mut removed = false;

        // Check if it's the best bid
        let is_best_bid = state.best_bid_id == target_id;
        let bid_owner_match_lo = state.best_bid_owner_lo == target_owner_lo;
        let bid_owner_match_hi = state.best_bid_owner_hi == target_owner_hi;
        let bid_owner_match = bid_owner_match_lo && bid_owner_match_hi;

        if is_best_bid && bid_owner_match {
            // Clear the best bid
            state.best_bid_price = 0;
            state.best_bid_amount = 0;
            state.best_bid_owner_lo = 0;
            state.best_bid_owner_hi = 0;
            state.best_bid_id = 0;
            removed = true;
        }

        // Check if it's the best ask
        let is_best_ask = state.best_ask_id == target_id;
        let ask_owner_match_lo = state.best_ask_owner_lo == target_owner_lo;
        let ask_owner_match_hi = state.best_ask_owner_hi == target_owner_hi;
        let ask_owner_match = ask_owner_match_lo && ask_owner_match_hi;

        if is_best_ask && ask_owner_match {
            // Clear the best ask
            state.best_ask_price = 18446744073709551615u64; // u64::MAX
            state.best_ask_amount = 0;
            state.best_ask_owner_lo = 0;
            state.best_ask_owner_hi = 0;
            state.best_ask_id = 0;
            removed = true;
        }

        if removed {
            state.order_count = state.order_count - 1;
        }

        (state_ctxt.owner.from_arcis(state), removed.reveal())
    }

    /// Match orders in the orderbook
    /// If best_bid.price >= best_ask.price, a match is found
    #[instruction]
    pub fn match_book(
        state_ctxt: Enc<Mxe, OrderBookState>,
    ) -> (Enc<Mxe, OrderBookState>, MatchResult) {
        let mut state = state_ctxt.to_arcis();

        // Initialize result with no match
        let mut result = MatchResult {
            matched: false,
            maker_order_id: 0,
            taker_order_id: 0,
            execution_price: 0,
            execution_amount: 0,
            maker_lo: 0,
            maker_hi: 0,
            taker_lo: 0,
            taker_hi: 0,
        };

        // Check for crossing orders
        let has_match = state.best_bid_price >= state.best_ask_price;
        let has_liquidity = state.best_bid_amount > 0;
        let has_ask = state.best_ask_amount > 0;

        // Self-trade prevention
        let same_owner_lo = state.best_bid_owner_lo == state.best_ask_owner_lo;
        let same_owner_hi = state.best_bid_owner_hi == state.best_ask_owner_hi;
        let is_self_trade = same_owner_lo && same_owner_hi;

        if has_match && has_liquidity && has_ask && !is_self_trade {
            // Calculate execution price (midpoint)
            let execution_price = (state.best_bid_price + state.best_ask_price) / 2;

            // Calculate execution amount (minimum of both)
            let mut execution_amount = state.best_bid_amount;
            if state.best_ask_amount < execution_amount {
                execution_amount = state.best_ask_amount;
            }

            // Set result
            result.matched = true;
            result.maker_order_id = state.best_ask_id;
            result.taker_order_id = state.best_bid_id;
            result.execution_price = execution_price;
            result.execution_amount = execution_amount;
            result.maker_lo = state.best_ask_owner_lo;
            result.maker_hi = state.best_ask_owner_hi;
            result.taker_lo = state.best_bid_owner_lo;
            result.taker_hi = state.best_bid_owner_hi;

            // Update state - clear filled orders
            let bid_remaining = state.best_bid_amount - execution_amount;
            let ask_remaining = state.best_ask_amount - execution_amount;

            if bid_remaining == 0 {
                state.best_bid_price = 0;
                state.best_bid_amount = 0;
                state.best_bid_owner_lo = 0;
                state.best_bid_owner_hi = 0;
                state.best_bid_id = 0;
            } else {
                state.best_bid_amount = bid_remaining;
            }

            if ask_remaining == 0 {
                state.best_ask_price = 18446744073709551615u64; // u64::MAX
                state.best_ask_amount = 0;
                state.best_ask_owner_lo = 0;
                state.best_ask_owner_hi = 0;
                state.best_ask_id = 0;
            } else {
                state.best_ask_amount = ask_remaining;
            }
        }

        (state_ctxt.owner.from_arcis(state), result.reveal())
    }
}
