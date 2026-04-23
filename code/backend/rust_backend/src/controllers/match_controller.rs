use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use sea_orm::*;

use crate::controllers::http_controller::{AppState, ApiResponse};
use crate::models::{match_entity, team_entity, match_pool_entity};

/// 首页赛事列表项
#[derive(Serialize, Deserialize, Clone)]
pub struct HomeMatchItem {
    pub id: u32,
    pub team_a: team_entity::Model,
    pub team_b: team_entity::Model,
    pub start_at: String,
    pub status: String,
    pub number_of_games: i32,
}

/// 赛事详情响应
#[derive(Serialize, Deserialize)]
pub struct MatchDetail {
    #[serde(flatten)]
    pub base: HomeMatchItem,
    pub winner_id: Option<u32>,
    pub solana_match_id: Option<String>,
    pub solana_match_pda: Option<String>,
    pub solana_tx_signature: Option<String>,
    pub match_pools: Option<match_pool_entity::Model>,
    pub updated_at: String,
}

/// 首页推荐赛事处理器
pub async fn featured_matches_handler(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let db = state.db_service.get_db();

    // 查询所有比赛
    let results = match match_entity::Entity::find()
        .all(db)
        .await {
            Ok(matches) => matches,
            Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<Vec<HomeMatchItem>>::error(e.to_string()))),
        };

    let mut home_matches = Vec::new();

    for m in results {
        // 分别查询 Team A 和 Team B
        let team_a = team_entity::Entity::find_by_id(m.team_a_id).one(db).await;
        let team_b = team_entity::Entity::find_by_id(m.team_b_id).one(db).await;

        if let (Ok(Some(ta)), Ok(Some(tb))) = (team_a, team_b) {
            home_matches.push(HomeMatchItem {
                id: m.id,
                team_a: ta,
                team_b: tb,
                start_at: m.start_at.to_string(),
                status: m.status,
                number_of_games: m.number_of_games,
            });
        }
    }

    (StatusCode::OK, Json(ApiResponse::success(home_matches)))
}

/// 获取赛事详情
pub async fn get_match_detail_handler(
    State(state): State<AppState>,
    Path(match_id): Path<u32>,
) -> impl IntoResponse {
    let db = state.db_service.get_db();

    // 1. 获取基础比赛信息
    let m = match match_entity::Entity::find_by_id(match_id).one(db).await {
        Ok(Some(m)) => m,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(ApiResponse::<MatchDetail>::error("Match not found".to_string()))),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<MatchDetail>::error(e.to_string()))),
    };

    // 2. 获取队伍信息
    let team_a = team_entity::Entity::find_by_id(m.team_a_id).one(db).await;
    let team_b = team_entity::Entity::find_by_id(m.team_b_id).one(db).await;

    let (ta, tb) = match (team_a, team_b) {
        (Ok(Some(ta)), Ok(Some(tb))) => (ta, tb),
        _ => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<MatchDetail>::error("Teams data incomplete".to_string()))),
    };

    let base = HomeMatchItem {
        id: m.id,
        team_a: ta,
        team_b: tb,
        start_at: m.start_at.to_string(),
        status: m.status,
        number_of_games: m.number_of_games,
    };

    // 2.5 获取奖池信息
    let match_pool = match_pool_entity::Entity::find()
        .filter(match_pool_entity::Column::MatchId.eq(m.id))
        .one(db)
        .await
        .ok()
        .flatten();

    // 3. 构造详情对象
    let detail = MatchDetail {
        base,
        winner_id: m.winner_id,
        solana_match_id: m.solana_match_id,
        solana_match_pda: m.solana_match_pda,
        solana_tx_signature: m.solana_tx_signature,
        match_pools: match_pool,
        updated_at: m.updated_at.to_string(),
    };

    (StatusCode::OK, Json(ApiResponse::success(detail)))
}
