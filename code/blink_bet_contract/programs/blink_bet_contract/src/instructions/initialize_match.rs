use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct InitializeMatch<'info> {
    #[account(
        init,
        payer = admin,
        space = MatchPool::SIZE,
        seeds = [b"match", match_id.as_bytes()],
        bump
    )]
    pub match_pool: Account<'info, MatchPool>,
    #[account(
        constraint = config.admin == admin.key()
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeMatch>,
    match_id: String,
    start_time: i64,
) -> Result<()> {
    let match_pool = &mut ctx.accounts.match_pool;
    match_pool.match_id = match_id.clone();
    match_pool.start_time = start_time;
    match_pool.total_pool_a = 0;
    match_pool.total_pool_b = 0;
    match_pool.winner = 0;
    match_pool.is_settled = false;
    match_pool.bump = ctx.bumps.match_pool;

    emit!(MatchInitialized {
        match_id,
        start_time,
        pool_pda: ctx.accounts.match_pool.key(),
    });

    Ok(())
}
