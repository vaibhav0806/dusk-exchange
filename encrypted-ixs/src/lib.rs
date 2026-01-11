//! Encrypted instructions for Dusk Exchange
//!
//! This module contains the Arcis MPC circuits for:
//! - add_order: Insert an encrypted order into the orderbook
//! - remove_order: Remove an order by ID
//! - match_book: Find and match crossing orders
//!
//! IMPORTANT: Arcium limitations to remember:
//! - No Vec/dynamic arrays - use ArcisArray<T, N> with fixed size
//! - No while loops or dynamic control flow on encrypted values
//! - Cannot reveal() inside if/else branches
//! - Encrypted comparisons are expensive (~100x plaintext)

use arcis::prelude::*;

/// Maximum number of orders in the orderbook
/// Keep this reasonable to limit MPC computation time
pub const MAX_ORDERS: usize = 64;

/// Price scaling factor (10^6 = 1 dollar)
/// e.g., $100.50 = 100_500_000
pub const PRICE_SCALE: u64 = 1_000_000;

/// Minimum order amount (in base token's smallest unit)
pub const MIN_ORDER_AMOUNT: u64 = 1000;

/// Represents a single order in the encrypted orderbook
#[derive(ArcisType, Copy, Clone, Default)]
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

    /// Timestamp when order was placed (for time priority)
    pub timestamp: u64,
}

impl Order {
    /// Create an empty/inactive order slot
    pub fn empty() -> Self {
        Self {
            price: 0,
            amount: 0,
            owner_lo: 0,
            owner_hi: 0,
            order_id: 0,
            side: false,
            is_active: false,
            timestamp: 0,
        }
    }
}

/// The encrypted orderbook containing all orders
#[derive(ArcisType, Copy, Clone)]
pub struct OrderBook {
    /// Fixed-size array of orders
    /// Active orders are marked with is_active = true
    pub orders: ArcisArray<Order, MAX_ORDERS>,

    /// Current number of active orders
    pub order_count: u8,
}

impl Default for OrderBook {
    fn default() -> Self {
        Self {
            orders: ArcisArray::default(),
            order_count: 0,
        }
    }
}

/// Result of a match operation
/// These fields are revealed after matching
#[derive(ArcisType, Copy, Clone, Default)]
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

/// Add a new order to the encrypted orderbook
///
/// # Arguments
/// * `order` - Encrypted order to add (Shared encryption = user can decrypt)
/// * `orderbook` - Reference to the MXE-owned encrypted orderbook
///
/// # Returns
/// Updated orderbook with the new order inserted
#[cfg(feature = "mpc")]
#[arcis_function]
pub fn add_order(
    order: Enc<Shared, Order>,
    orderbook: Enc<Mxe, &OrderBook>,
) -> Enc<Mxe, OrderBook> {
    // Decrypt inputs for computation
    let new_order = order.to_arcis();
    let mut ob = orderbook.to_arcis();

    // Find first empty slot
    // Note: Using fixed iteration because we can't use while loops
    let mut inserted = false;

    for i in 0..MAX_ORDERS {
        if !inserted {
            let slot = ob.orders.get(i);
            if !slot.is_active {
                // Found empty slot, insert order
                ob.orders.set(i, new_order);
                inserted = true;
            }
        }
    }

    // Increment order count if inserted
    if inserted {
        ob.order_count = ob.order_count.saturating_add(1);
    }

    // Re-encrypt and return
    orderbook.owner.from_arcis(ob)
}

/// Remove an order from the orderbook by ID
///
/// # Arguments
/// * `order_id` - ID of the order to remove
/// * `owner_lo` - Lower bits of owner pubkey (for authorization)
/// * `owner_hi` - Upper bits of owner pubkey
/// * `orderbook` - Reference to the encrypted orderbook
///
/// # Returns
/// Updated orderbook with the order removed
#[cfg(feature = "mpc")]
#[arcis_function]
pub fn remove_order(
    order_id: u64,
    owner_lo: u128,
    owner_hi: u128,
    orderbook: Enc<Mxe, &OrderBook>,
) -> Enc<Mxe, OrderBook> {
    let mut ob = orderbook.to_arcis();
    let mut removed = false;

    for i in 0..MAX_ORDERS {
        if !removed {
            let slot = ob.orders.get(i);
            // Check if this is the order and owner matches
            if slot.is_active
                && slot.order_id == order_id
                && slot.owner_lo == owner_lo
                && slot.owner_hi == owner_hi
            {
                // Mark as inactive
                let mut updated_slot = slot;
                updated_slot.is_active = false;
                ob.orders.set(i, updated_slot);
                removed = true;
            }
        }
    }

    // Decrement order count if removed
    if removed {
        ob.order_count = ob.order_count.saturating_sub(1);
    }

    orderbook.owner.from_arcis(ob)
}

/// Match orders in the orderbook
///
/// Finds the best matching bid and ask:
/// - Best bid: highest price buy order
/// - Best ask: lowest price sell order
/// - Match if bid.price >= ask.price
///
/// # Arguments
/// * `orderbook` - Reference to the encrypted orderbook
///
/// # Returns
/// Tuple of (updated orderbook, match result)
/// Match result fields are revealed for settlement
#[cfg(feature = "mpc")]
#[arcis_function]
pub fn match_book(
    orderbook: Enc<Mxe, &OrderBook>,
) -> (Enc<Mxe, OrderBook>, MatchResult) {
    let mut ob = orderbook.to_arcis();
    let mut result = MatchResult::default();

    // Find best bid (highest price buy order)
    let mut best_bid_idx: i32 = -1;
    let mut best_bid_price: u64 = 0;
    let mut best_bid_timestamp: u64 = u64::MAX;

    // Find best ask (lowest price sell order)
    let mut best_ask_idx: i32 = -1;
    let mut best_ask_price: u64 = u64::MAX;
    let mut best_ask_timestamp: u64 = u64::MAX;

    // Scan all orders to find best bid and ask
    for i in 0..MAX_ORDERS {
        let order = ob.orders.get(i);
        if order.is_active {
            if order.side {
                // Buy order
                // Better if: higher price, or same price but earlier timestamp
                if order.price > best_bid_price
                    || (order.price == best_bid_price && order.timestamp < best_bid_timestamp)
                {
                    best_bid_idx = i as i32;
                    best_bid_price = order.price;
                    best_bid_timestamp = order.timestamp;
                }
            } else {
                // Sell order
                // Better if: lower price, or same price but earlier timestamp
                if order.price < best_ask_price
                    || (order.price == best_ask_price && order.timestamp < best_ask_timestamp)
                {
                    best_ask_idx = i as i32;
                    best_ask_price = order.price;
                    best_ask_timestamp = order.timestamp;
                }
            }
        }
    }

    // Check if we have a match (bid.price >= ask.price)
    let has_match = best_bid_idx >= 0
        && best_ask_idx >= 0
        && best_bid_price >= best_ask_price;

    if has_match {
        let bid = ob.orders.get(best_bid_idx as usize);
        let ask = ob.orders.get(best_ask_idx as usize);

        // Self-trade prevention
        let is_self_trade = bid.owner_lo == ask.owner_lo && bid.owner_hi == ask.owner_hi;

        if !is_self_trade {
            // Calculate execution details
            // Execution price = midpoint of bid and ask
            let execution_price = (best_bid_price + best_ask_price) / 2;

            // Execution amount = minimum of bid and ask amounts
            let execution_amount = if bid.amount < ask.amount {
                bid.amount
            } else {
                ask.amount
            };

            // Update orders
            let mut updated_bid = bid;
            let mut updated_ask = ask;

            // Reduce amounts or deactivate if fully filled
            if bid.amount <= execution_amount {
                updated_bid.is_active = false;
                ob.order_count = ob.order_count.saturating_sub(1);
            } else {
                updated_bid.amount = bid.amount - execution_amount;
            }

            if ask.amount <= execution_amount {
                updated_ask.is_active = false;
                ob.order_count = ob.order_count.saturating_sub(1);
            } else {
                updated_ask.amount = ask.amount - execution_amount;
            }

            ob.orders.set(best_bid_idx as usize, updated_bid);
            ob.orders.set(best_ask_idx as usize, updated_ask);

            // Populate result (these will be revealed)
            result.matched = true;
            result.maker_order_id = ask.order_id; // Resting order is maker
            result.taker_order_id = bid.order_id; // Crossing order is taker
            result.execution_price = execution_price;
            result.execution_amount = execution_amount;
            result.maker_lo = ask.owner_lo;
            result.maker_hi = ask.owner_hi;
            result.taker_lo = bid.owner_lo;
            result.taker_hi = bid.owner_hi;
            result.maker_is_buy = false; // Maker was selling
        }
    }

    // Return updated orderbook and revealed result
    (orderbook.owner.from_arcis(ob), result.reveal())
}

/// Get all orders for a specific user (encrypted)
///
/// # Arguments
/// * `owner_lo` - Lower bits of owner pubkey
/// * `owner_hi` - Upper bits of owner pubkey
/// * `orderbook` - Reference to the encrypted orderbook
///
/// # Returns
/// Array of the user's orders (encrypted for the user)
#[cfg(feature = "mpc")]
#[arcis_function]
pub fn get_user_orders(
    owner_lo: u128,
    owner_hi: u128,
    orderbook: Enc<Mxe, &OrderBook>,
) -> Enc<Shared, ArcisArray<Order, MAX_ORDERS>> {
    let ob = orderbook.to_arcis();
    let mut user_orders = ArcisArray::<Order, MAX_ORDERS>::default();

    let mut user_order_idx = 0;

    for i in 0..MAX_ORDERS {
        let order = ob.orders.get(i);
        if order.is_active && order.owner_lo == owner_lo && order.owner_hi == owner_hi {
            user_orders.set(user_order_idx, order);
            user_order_idx += 1;
        }
    }

    // Encrypt for the user (Shared encryption)
    Enc::<Shared, _>::from_arcis(user_orders)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_order_creation() {
        let order = Order {
            price: 100_000_000, // $100
            amount: 1_000_000,   // 1 SOL
            owner_lo: 12345,
            owner_hi: 67890,
            order_id: 1,
            side: true,
            is_active: true,
            timestamp: 1000,
        };

        assert!(order.is_active);
        assert!(order.side); // is buy
        assert_eq!(order.price, 100_000_000);
    }

    #[test]
    fn test_orderbook_default() {
        let ob = OrderBook::default();
        assert_eq!(ob.order_count, 0);
    }

    #[test]
    fn test_match_result_default() {
        let result = MatchResult::default();
        assert!(!result.matched);
        assert_eq!(result.execution_price, 0);
        assert_eq!(result.execution_amount, 0);
    }
}
