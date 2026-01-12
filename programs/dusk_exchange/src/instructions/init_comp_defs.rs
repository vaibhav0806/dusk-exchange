use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use crate::ID;

/// Initialize computation definition for add_order
#[init_computation_definition_accounts("add_order", payer)]
#[derive(Accounts)]
pub struct InitAddOrderCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Arcium computation definition account (PDA derived by macro)
    #[account(mut)]
    pub comp_def_account: UncheckedAccount<'info>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

pub fn init_add_order_handler(ctx: Context<InitAddOrderCompDef>) -> Result<()> {
    msg!("Initializing add_order computation definition");
    init_comp_def(ctx.accounts, None, None)?;
    Ok(())
}

/// Initialize computation definition for remove_order
#[init_computation_definition_accounts("remove_order", payer)]
#[derive(Accounts)]
pub struct InitRemoveOrderCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Arcium computation definition account (PDA derived by macro)
    #[account(mut)]
    pub comp_def_account: UncheckedAccount<'info>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

pub fn init_remove_order_handler(ctx: Context<InitRemoveOrderCompDef>) -> Result<()> {
    msg!("Initializing remove_order computation definition");
    init_comp_def(ctx.accounts, None, None)?;
    Ok(())
}

/// Initialize computation definition for match_book
#[init_computation_definition_accounts("match_book", payer)]
#[derive(Accounts)]
pub struct InitMatchBookCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Arcium computation definition account (PDA derived by macro)
    #[account(mut)]
    pub comp_def_account: UncheckedAccount<'info>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

pub fn init_match_book_handler(ctx: Context<InitMatchBookCompDef>) -> Result<()> {
    msg!("Initializing match_book computation definition");
    init_comp_def(ctx.accounts, None, None)?;
    Ok(())
}
