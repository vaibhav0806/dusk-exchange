use anchor_lang::prelude::*;
// Arcium prelude - commented out temporarily to avoid macro conflicts
// Will be enabled when implementing queue_computation CPIs
// use arcium_anchor::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Computation definition offsets for Arcium MPC operations
/// Each encrypted function needs a unique offset
pub const ADD_ORDER_COMP_DEF_OFFSET: u8 = 0;
pub const REMOVE_ORDER_COMP_DEF_OFFSET: u8 = 1;
pub const MATCH_BOOK_COMP_DEF_OFFSET: u8 = 2;

#[program]
pub mod dusk_exchange {
    use super::*;

    /// Initialize a new trading market (e.g., SOL/USDC)
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        fee_rate_bps: u16,
    ) -> Result<()> {
        instructions::initialize_market::handler(ctx, market_id, fee_rate_bps)
    }

    /// Deposit tokens into the exchange for trading
    pub fn deposit(ctx: Context<Deposit>, amount: u64, is_base: bool) -> Result<()> {
        instructions::deposit::handler(ctx, amount, is_base)
    }

    /// Withdraw tokens from the exchange
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, is_base: bool) -> Result<()> {
        instructions::withdraw::handler(ctx, amount, is_base)
    }

    /// Initialize the computation definition for adding orders
    /// This must be called once before any orders can be placed
    pub fn init_add_order_comp_def(ctx: Context<InitAddOrderCompDef>) -> Result<()> {
        instructions::init_comp_defs::init_add_order_handler(ctx)
    }

    /// Initialize the computation definition for removing orders
    pub fn init_remove_order_comp_def(ctx: Context<InitRemoveOrderCompDef>) -> Result<()> {
        instructions::init_comp_defs::init_remove_order_handler(ctx)
    }

    /// Initialize the computation definition for matching orders
    pub fn init_match_book_comp_def(ctx: Context<InitMatchBookCompDef>) -> Result<()> {
        instructions::init_comp_defs::init_match_book_handler(ctx)
    }

    /// Place an encrypted limit order
    /// Order details (price, amount) are encrypted with Arcium
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        order_id: u64,
        is_buy: bool,
        encrypted_price: Vec<u8>,
        encrypted_amount: Vec<u8>,
        nonce: [u8; 12],
    ) -> Result<()> {
        instructions::place_order::handler(ctx, order_id, is_buy, encrypted_price, encrypted_amount, nonce)
    }

    /// Callback handler for place_order computation
    pub fn place_order_callback(ctx: Context<PlaceOrderCallback>) -> Result<()> {
        instructions::place_order::callback_handler(ctx)
    }

    /// Cancel an existing order
    pub fn cancel_order(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
        instructions::cancel_order::handler(ctx, order_id)
    }

    /// Callback handler for cancel_order computation
    pub fn cancel_order_callback(ctx: Context<CancelOrderCallback>) -> Result<()> {
        instructions::cancel_order::callback_handler(ctx)
    }

    /// Trigger order matching via MPC
    /// Anyone can call this to match crossing orders
    pub fn match_orders(ctx: Context<MatchOrders>) -> Result<()> {
        instructions::match_orders::handler(ctx)
    }

    /// Callback handler for match_orders computation
    /// Receives revealed execution price and amount
    pub fn match_orders_callback(
        ctx: Context<MatchOrdersCallback>,
        matched: bool,
        execution_price: u64,
        execution_amount: u64,
        maker_order_id: u64,
        taker_order_id: u64,
    ) -> Result<()> {
        instructions::match_orders::callback_handler(
            ctx, matched, execution_price, execution_amount, maker_order_id, taker_order_id
        )
    }

    /// Settle a matched trade by transferring tokens
    pub fn settle_trade(ctx: Context<SettleTrade>) -> Result<()> {
        instructions::settle_trade::handler(ctx)
    }
}
