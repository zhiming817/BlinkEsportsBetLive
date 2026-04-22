use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("AcAyrnzU2cTMTGR6TV9ry8VHCbiPU68R3mG964agr8uv");

#[program]
pub mod blink_bet_contract {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, fee_bps: u16) -> Result<()> {
        instructions::initialize_config::handler(ctx, fee_bps)
    }

    pub fn initialize_match(
        ctx: Context<InitializeMatch>,
        match_id: String,
        start_time: i64,
    ) -> Result<()> {
        instructions::initialize_match::handler(ctx, match_id, start_time)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, match_id: String, amount: u64, side: u8) -> Result<()> {
        instructions::place_bet::handler(ctx, match_id, amount, side)
    }

    pub fn settle_match(ctx: Context<SettleMatch>, match_id: String, winner_side: u8) -> Result<()> {
        instructions::settle_match::handler(ctx, match_id, winner_side)
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>, match_id: String) -> Result<()> {
        instructions::claim_prize::handler(ctx, match_id)
    }
}
