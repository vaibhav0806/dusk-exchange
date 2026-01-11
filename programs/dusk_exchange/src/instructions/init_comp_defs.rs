use anchor_lang::prelude::*;
// Arcium integration - uncomment when connecting to testnet
// use arcium_anchor::init_comp_def;

// These offsets will be used when integrating with Arcium
#[allow(unused_imports)]
use crate::{ADD_ORDER_COMP_DEF_OFFSET, REMOVE_ORDER_COMP_DEF_OFFSET, MATCH_BOOK_COMP_DEF_OFFSET};

/// Initialize computation definition for add_order
#[derive(Accounts)]
pub struct InitAddOrderCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Arcium computation definition account
    #[account(mut)]
    pub comp_def: AccountInfo<'info>,

    /// CHECK: Arcium program
    pub arcium_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_add_order_handler(_ctx: Context<InitAddOrderCompDef>) -> Result<()> {
    // Initialize the add_order computation definition
    // This registers the encrypted function with Arcium
    msg!("Initializing add_order computation definition");

    // TODO: Call arcium init_comp_def CPI
    // init_comp_def!(
    //     ctx.accounts.payer,
    //     ctx.accounts.comp_def,
    //     ctx.accounts.arcium_program,
    //     ADD_ORDER_COMP_DEF_OFFSET,
    //     encrypted_ixs::add_order
    // )?;

    Ok(())
}

/// Initialize computation definition for remove_order
#[derive(Accounts)]
pub struct InitRemoveOrderCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Arcium computation definition account
    #[account(mut)]
    pub comp_def: AccountInfo<'info>,

    /// CHECK: Arcium program
    pub arcium_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_remove_order_handler(_ctx: Context<InitRemoveOrderCompDef>) -> Result<()> {
    msg!("Initializing remove_order computation definition");

    // TODO: Call arcium init_comp_def CPI
    // init_comp_def!(
    //     ctx.accounts.payer,
    //     ctx.accounts.comp_def,
    //     ctx.accounts.arcium_program,
    //     REMOVE_ORDER_COMP_DEF_OFFSET,
    //     encrypted_ixs::remove_order
    // )?;

    Ok(())
}

/// Initialize computation definition for match_book
#[derive(Accounts)]
pub struct InitMatchBookCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Arcium computation definition account
    #[account(mut)]
    pub comp_def: AccountInfo<'info>,

    /// CHECK: Arcium program
    pub arcium_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_match_book_handler(_ctx: Context<InitMatchBookCompDef>) -> Result<()> {
    msg!("Initializing match_book computation definition");

    // TODO: Call arcium init_comp_def CPI
    // init_comp_def!(
    //     ctx.accounts.payer,
    //     ctx.accounts.comp_def,
    //     ctx.accounts.arcium_program,
    //     MATCH_BOOK_COMP_DEF_OFFSET,
    //     encrypted_ixs::match_book
    // )?;

    Ok(())
}
