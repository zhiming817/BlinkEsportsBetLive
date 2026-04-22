use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;
use crate::events::MatchSettled;

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct SettleMatch<'info> {
    #[account(
        mut,
        seeds = [b"match", match_id.as_bytes()],
        bump = match_pool.bump,
        constraint = config.admin == admin.key()
    )]
    pub match_pool: Account<'info, MatchPool>,
    pub config: Account<'info, GlobalConfig>,
    pub admin: Signer<'info>,
}

pub fn handler(ctx: Context<SettleMatch>, _match_id: String, winner_side: u8) -> Result<()> {
    let match_pool = &mut ctx.accounts.match_pool;
    
    require!(!match_pool.is_settled, ErrorCode::MatchAlreadySettled);
    require!(winner_side <= 2, ErrorCode::InvalidSide);

    match_pool.winner = winner_side;
    match_pool.is_settled = true;

    emit!(MatchSettled {
        match_id: match_pool.match_id.clone(),
        winner_side,
        total_pool_a: match_pool.total_pool_a,
        total_pool_b: match_pool.total_pool_b,
    });

    Ok(())
}
