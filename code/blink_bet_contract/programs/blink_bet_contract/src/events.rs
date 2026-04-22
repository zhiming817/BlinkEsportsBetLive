use anchor_lang::prelude::*;

#[event]
pub struct MatchInitialized {
    pub match_id: String,
    pub start_time: i64,
    pub pool_pda: Pubkey,
}

#[event]
pub struct BetPlaced {
    pub match_id: String,
    pub user: Pubkey,
    pub side: u8,
    pub amount: u64,
}

#[event]
pub struct MatchSettled {
    pub match_id: String,
    pub winner_side: u8,
    pub total_pool_a: u64,
    pub total_pool_b: u64,
}

#[event]
pub struct PrizeClaimed {
    pub match_id: String,
    pub user: Pubkey,
    pub amount: u64,
}
