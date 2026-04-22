use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;
use crate::events::BetPlaced;

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct PlaceBet<'info> {
    #[account(
        mut,
        seeds = [b"match", match_id.as_bytes()],
        bump = match_pool.bump
    )]
    pub match_pool: Account<'info, MatchPool>,
    #[account(
        init_if_needed,
        payer = user,
        space = UserBet::SIZE,
        seeds = [b"bet", match_id.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub user_bet: Account<'info, UserBet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PlaceBet>, match_id: String, amount: u64, side: u8) -> Result<()> {
    let match_pool = &mut ctx.accounts.match_pool;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp < match_pool.start_time,
        ErrorCode::MatchAlreadyStarted
    );

    require!(side == 1 || side == 2, ErrorCode::InvalidSide);

    let cpi_context = anchor_lang::system_program::Transfer {
        from: ctx.accounts.user.to_account_info(),
        to: match_pool.to_account_info(),
    };
    anchor_lang::system_program::transfer(
        CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_context),
        amount,
    )?;

    if side == 1 {
        match_pool.total_pool_a = match_pool.total_pool_a.checked_add(amount).unwrap();
    } else {
        match_pool.total_pool_b = match_pool.total_pool_b.checked_add(amount).unwrap();
    }

    let user_bet = &mut ctx.accounts.user_bet;
    user_bet.user = ctx.accounts.user.key();
    user_bet.amount = user_bet.amount.checked_add(amount).unwrap();
    user_bet.side = side;
    user_bet.is_claimed = false;

    emit!(BetPlaced {
        match_id,
        user: ctx.accounts.user.key(),
        side,
        amount,
    });

    Ok(())
}
