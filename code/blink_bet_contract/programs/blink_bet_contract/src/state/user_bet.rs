use anchor_lang::prelude::*;

#[account]
pub struct UserBet {
    pub user: Pubkey,
    pub amount: u64,
    pub side: u8,
    pub is_claimed: bool,
}

impl UserBet {
    pub const SIZE: usize = 8 + 32 + 8 + 1 + 1;
}
