use anchor_lang::prelude::*;

/// User position account tracking deposits and orders for a specific market
/// Seeds: ["user_position", market, owner]
#[account]
#[derive(Default)]
pub struct UserPosition {
    /// Owner of this position
    pub owner: Pubkey,

    /// Market this position belongs to
    pub market: Pubkey,

    /// Total base tokens deposited (available + locked in orders)
    pub base_deposited: u64,

    /// Total quote tokens deposited (available + locked in orders)
    pub quote_deposited: u64,

    /// Base tokens currently locked in open sell orders
    pub base_locked: u64,

    /// Quote tokens currently locked in open buy orders
    pub quote_locked: u64,

    /// Number of active orders
    pub active_order_count: u8,

    /// PDA bump seed
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 +  // discriminator
        32 +  // owner
        32 +  // market
        8 +   // base_deposited
        8 +   // quote_deposited
        8 +   // base_locked
        8 +   // quote_locked
        1 +   // active_order_count
        1;    // bump

    pub const SEED_PREFIX: &'static [u8] = b"user_position";

    /// Available base tokens (not locked in orders)
    pub fn base_available(&self) -> u64 {
        self.base_deposited.saturating_sub(self.base_locked)
    }

    /// Available quote tokens (not locked in orders)
    pub fn quote_available(&self) -> u64 {
        self.quote_deposited.saturating_sub(self.quote_locked)
    }

    /// Lock tokens for a new order
    pub fn lock_for_order(&mut self, amount: u64, is_buy: bool) -> Result<()> {
        if is_buy {
            require!(
                self.quote_available() >= amount,
                crate::errors::DuskError::InsufficientBalance
            );
            self.quote_locked = self.quote_locked.checked_add(amount)
                .ok_or(crate::errors::DuskError::MathOverflow)?;
        } else {
            require!(
                self.base_available() >= amount,
                crate::errors::DuskError::InsufficientBalance
            );
            self.base_locked = self.base_locked.checked_add(amount)
                .ok_or(crate::errors::DuskError::MathOverflow)?;
        }
        self.active_order_count = self.active_order_count.checked_add(1)
            .ok_or(crate::errors::DuskError::TooManyOrders)?;
        Ok(())
    }

    /// Unlock tokens when order is cancelled
    pub fn unlock_for_cancel(&mut self, amount: u64, is_buy: bool) {
        if is_buy {
            self.quote_locked = self.quote_locked.saturating_sub(amount);
        } else {
            self.base_locked = self.base_locked.saturating_sub(amount);
        }
        self.active_order_count = self.active_order_count.saturating_sub(1);
    }
}

/// Seeds for deriving user position PDA
pub fn user_position_seeds<'a>(market: &'a Pubkey, owner: &'a Pubkey) -> [&'a [u8]; 3] {
    [
        UserPosition::SEED_PREFIX,
        market.as_ref(),
        owner.as_ref(),
    ]
}
