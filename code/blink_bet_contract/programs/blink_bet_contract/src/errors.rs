use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("赛事已经开始，停止下注")]
    MatchAlreadyStarted,
    #[msg("无效的下注方向")]
    InvalidSide,
    #[msg("赛事尚未结算")]
    MatchNotSettled,
    #[msg("赛事已经结算过")]
    MatchAlreadySettled,
    #[msg("已经领取过奖金")]
    AlreadyClaimed,
    #[msg("非胜方下注者，无奖金可领")]
    NotWinner,
}
