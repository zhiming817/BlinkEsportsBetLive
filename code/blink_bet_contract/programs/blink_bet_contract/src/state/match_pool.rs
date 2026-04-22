use anchor_lang::prelude::*;

#[account]
pub struct MatchPool {
    pub match_id: String,
    pub start_time: i64,
    pub total_pool_a: u64,
    pub total_pool_b: u64,
    pub winner: u8,
    pub is_settled: bool,
    pub bump: u8,
}

impl MatchPool {
    // 假设 String 长度最大为 32
    pub const SIZE: usize = 8 + (4 + 32) + 8 + 8 + 8 + 1 + 1 + 1;
}
