use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;
use crate::events::PrizeClaimed;

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [b"match", match_id.as_bytes()],
        bump = match_pool.bump
    )]
    pub match_pool: Account<'info, MatchPool>,
    #[account(
        mut,
        seeds = [b"bet", match_id.as_bytes(), user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub user_bet: Account<'info, UserBet>,
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, address = config.fee_recipient)]
    /// CHECK: Validated in address constraint
    pub fee_recipient: AccountInfo<'info>,
}

pub fn handler(ctx: Context<ClaimPrize>, match_id: String) -> Result<()> {
    let match_pool = &ctx.accounts.match_pool;
    let user_bet = &mut ctx.accounts.user_bet;
    let config = &ctx.accounts.config;

    require!(match_pool.is_settled, ErrorCode::MatchNotSettled);
    require!(!user_bet.is_claimed, ErrorCode::AlreadyClaimed);
    require!(user_bet.side == match_pool.winner, ErrorCode::NotWinner);

    let total_pool = match_pool.total_pool_a.checked_add(match_pool.total_pool_b).unwrap();
    let winner_pool = if match_pool.winner == 1 {
        match_pool.total_pool_a
    } else {
        match_pool.total_pool_b
    };

    let raw_prize = (user_bet.amount as u128)
        .checked_mul(total_pool as u128).unwrap()
        .checked_div(winner_pool as u128).unwrap() as u64;

    let fee = (raw_prize as u128)
        .checked_mul(config.fee_bps as u128).unwrap()
        .checked_div(10000).unwrap() as u64;
    
    let net_prize = raw_prize.checked_sub(fee).unwrap();

    **match_pool.to_account_info().try_borrow_mut_lamports()? -= net_prize;
    **ctx.accounts.user.try_borrow_mut_lamports()? += net_prize;

    **match_pool.to_account_info().try_borrow_mut_lamports()? -= fee;
    **ctx.accounts.fee_recipient.try_borrow_mut_lamports()? += fee;

    user_bet.is_claimed = true;

    emit!(PrizeClaimed {
        match_id,
        user: ctx.accounts.user.key(),
        amount: net_prize,
    });

    Ok(())
}
