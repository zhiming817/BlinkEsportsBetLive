use axum::{
    extract::{State, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use sea_orm::*;

use crate::controllers::http_controller::{AppState, ApiResponse};
use crate::models::{user_bet_entity, match_entity, team_entity};

#[derive(Deserialize)]
pub struct MyBetsQuery {
    pub wallet_address: Option<String>,
    pub user_id: Option<u32>,
    pub status: Option<String>, // "Active" or "History"
}

#[derive(Serialize, Deserialize)]
pub struct UserBetItem {
    pub id: u32,
    pub match_id: u32,
    pub match_name: String,
    pub league: String,
    pub start_at: String,
    pub amount: String,
    pub side: i8, // 1 for A, 2 for B
    pub side_name: String,
    pub status: String, // "Win", "Lose", "Pending"
    pub claim_status: i8, // 0: Not claimed, 1: Claimed
}

pub async fn get_user_bets_handler(
    State(state): State<AppState>,
    Query(query): Query<MyBetsQuery>,
) -> impl IntoResponse {
    let db = state.db_service.get_db();

    // 1. 构造查询条件
    let mut select = user_bet_entity::Entity::find();
    
    if let Some(wallet) = query.wallet_address {
        select = select.filter(user_bet_entity::Column::WalletAddress.eq(wallet));
    } else if let Some(uid) = query.user_id {
        select = select.filter(user_bet_entity::Column::UserId.eq(uid));
    } else {
        return (StatusCode::BAD_REQUEST, Json(ApiResponse::<Vec<UserBetItem>>::error("wallet_address or user_id is required".to_string())));
    }

    // 2. 执行查询并排序
    let results = match select.order_by_desc(user_bet_entity::Column::CreatedAt).all(db).await {
        Ok(bets) => bets,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<Vec<UserBetItem>>::error(e.to_string()))),
    };

    let mut user_bets = Vec::new();

    for bet in results {
        // 获取比赛信息
        let m = match match_entity::Entity::find_by_id(bet.match_id).one(db).await {
            Ok(Some(m)) => m,
            _ => continue,
        };

        // 简单的 Active/History 过滤逻辑
        if let Some(ref status_filter) = query.status {
            if status_filter == "Active" && m.status == "Finished" {
                continue;
            }
            if status_filter == "History" && m.status != "Finished" {
                continue;
            }
        }

        // 获取队伍信息
        let team_a = team_entity::Entity::find_by_id(m.team_a_id).one(db).await;
        let team_b = team_entity::Entity::find_by_id(m.team_b_id).one(db).await;

        if let (Ok(Some(ta)), Ok(Some(tb))) = (team_a, team_b) {
            let side_name = if bet.side == 1 { ta.name.clone() } else { tb.name.clone() };
            
            let status = if m.status != "Finished" {
                "Pending".to_string()
            } else if let Some(winner_id) = m.winner_id {
                let bet_won = (bet.side == 1 && winner_id == m.team_a_id) || (bet.side == 2 && winner_id == m.team_b_id);
                if bet_won { "Win".to_string() } else { "Lose".to_string() }
            } else {
                "Pending".to_string()
            };

            user_bets.push(UserBetItem {
                id: bet.id,
                match_id: bet.match_id,
                match_name: format!("{} vs {}", ta.name, tb.name),
                league: "Major League".to_string(), // 暂时硬编码
                start_at: m.start_at.to_string(),
                amount: bet.amount.to_string(),
                side: bet.side,
                side_name,
                status,
                claim_status: bet.claim_status,
            });
        }
    }

    (StatusCode::OK, Json(ApiResponse::success(user_bets)))
}
