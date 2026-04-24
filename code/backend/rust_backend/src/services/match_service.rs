use sea_orm::*;
use crate::models::{match_entity, match_pool_entity, user_entity, user_bet_entity};
use std::sync::Arc;
use crate::services::DatabaseService;
use chrono::Utc;
use sea_orm::prelude::Decimal;

pub struct MatchService {
    db: Arc<DatabaseService>,
}

impl MatchService {
    pub fn new(db: Arc<DatabaseService>) -> Self {
        Self { db }
    }

    pub fn get_db(&self) -> &DatabaseConnection {
        self.db.get_db()
    }

    /// 更新比赛的 Solana 关联信息
    pub async fn update_solana_info(
        &self,
        match_id_str: &str,
        solana_match_id: String,
        solana_match_pda: String,
        solana_tx_signature: String,
    ) -> anyhow::Result<()> {
        let db = self.db.get_db();
        
        let match_id_numeric = if match_id_str.starts_with("match_") {
            match_id_str.replace("match_", "").parse::<u32>()?
        } else {
            match_id_str.parse::<u32>()?
        };

        let match_record = match_entity::Entity::find_by_id(match_id_numeric)
            .one(db)
            .await?
            .ok_or_else(|| anyhow::anyhow!("数据库中找不到比赛 ID: {}", match_id_numeric))?;

        let mut active_model: match_entity::ActiveModel = match_record.into();
        active_model.solana_match_id = Set(Some(solana_match_id.clone()));
        active_model.solana_match_pda = Set(Some(solana_match_pda.clone()));
        active_model.solana_tx_signature = Set(Some(solana_tx_signature.clone()));
        active_model.updated_at = Set(Utc::now());

        active_model.update(db).await?;

        // 2. 同步到 match_pools 表
        // 先检查是否已存在
        let pool_exists = match_pool_entity::Entity::find()
            .filter(match_pool_entity::Column::MatchId.eq(match_id_numeric))
            .one(db)
            .await?;

        if pool_exists.is_none() {
            let pool_model = match_pool_entity::ActiveModel {
                match_id: Set(match_id_numeric),
                pda_address: Set(solana_match_pda),
                total_pool_a: Set(Decimal::from(0)),
                total_pool_b: Set(Decimal::from(0)),
                is_settled: Set(0),
                ..Default::default()
            };
            pool_model.insert(db).await?;
            println!("✅ 已为比赛 {} 创建奖池记录", match_id_numeric);
        }
        
        Ok(())
    }

    /// 处理下注逻辑
    pub async fn handle_bet_placed(
        &self,
        match_id_str: &str,
        user_wallet: String,
        side: u8,
        amount_lamports: u64,
        tx_hash: String,
    ) -> anyhow::Result<()> {
        let db = self.db.get_db();
        let match_id_numeric = if match_id_str.starts_with("match_") {
            match_id_str.replace("match_", "").parse::<u32>()?
        } else {
            match_id_str.parse::<u32>()?
        };

        // 1. 确保用户存在，不存在则创建
        let user = user_entity::Entity::find()
            .filter(user_entity::Column::WalletAddress.eq(user_wallet.clone()))
            .one(db)
            .await?;

        let user_id = if let Some(u) = user {
            u.id
        } else {
            let new_user = user_entity::ActiveModel {
                wallet_address: Set(user_wallet.clone()),
                created_at: Set(Utc::now()),
                ..Default::default()
            };
            let res = new_user.insert(db).await?;
            res.id
        };

        // 2. 将 lamports 转换为 SOL Decimal (1 SOL = 10^9 lamports)
        let amount_sol = Decimal::from(amount_lamports) / Decimal::from(1_000_000_000);

        // 3. 记录到 user_bets 表
        let bet_model = user_bet_entity::ActiveModel {
            user_id: Set(user_id),
            wallet_address: Set(user_wallet.clone()),
            match_id: Set(match_id_numeric),
            tx_hash: Set(tx_hash),
            side: Set(side as i8),
            amount: Set(amount_sol),
            claim_status: Set(0),
            created_at: Set(Utc::now()),
            ..Default::default()
        };
        bet_model.insert(db).await?;

        // 4. 更新 match_pools 中的总奖池
        let pool = match_pool_entity::Entity::find()
            .filter(match_pool_entity::Column::MatchId.eq(match_id_numeric))
            .one(db)
            .await?
            .ok_or_else(|| anyhow::anyhow!("找不到比赛 {} 的奖池", match_id_numeric))?;

        let mut active_pool: match_pool_entity::ActiveModel = pool.into();
        if side == 1 {
            let current = active_pool.total_pool_a.unwrap();
            active_pool.total_pool_a = Set(current + amount_sol);
        } else {
            let current = active_pool.total_pool_b.unwrap();
            active_pool.total_pool_b = Set(current + amount_sol);
        }

        active_pool.update(db).await?;
        println!("💰 数据库下注已持久化: Match={}, User={}, Side={}, Amount={} SOL", match_id_numeric, user_wallet, side, amount_sol);

        Ok(())
    }

    /// 处理比赛结算逻辑
    pub async fn settle_match(
        &self,
        match_id_str: &str,
        winner_side: u8,
    ) -> anyhow::Result<()> {
        let db = self.db.get_db();
        let match_id_numeric = match_id_str.replace("match_", "").parse::<u32>()?;

        // 1. 更新比赛状态
        let match_record = match_entity::Entity::find_by_id(match_id_numeric)
            .one(db)
            .await?
            .ok_or_else(|| anyhow::anyhow!("找不到比赛"))?;

        let mut active_model: match_entity::ActiveModel = match_record.into();
        active_model.status = Set("finished".to_string());
        
        let winner_id = if winner_side == 1 {
            active_model.team_a_id.clone().unwrap()
        } else {
            active_model.team_b_id.clone().unwrap()
        };
        
        active_model.winner_id = Set(Some(winner_id));
        active_model.updated_at = Set(Utc::now());
        active_model.update(db).await?;

        // 2. 更新奖池结算状态
        if let Some(pool) = match_pool_entity::Entity::find()
            .filter(match_pool_entity::Column::MatchId.eq(match_id_numeric))
            .one(db)
            .await? {
            let mut active_pool: match_pool_entity::ActiveModel = pool.into();
            active_pool.is_settled = Set(1);
            active_pool.update(db).await?;
        }

        Ok(())
    }
}
