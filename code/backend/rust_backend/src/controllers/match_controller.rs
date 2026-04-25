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
    pub is_featured: bool,
    pub embed_url: Option<String>,
}

/// 赔率信息
#[derive(Serialize, Deserialize, Clone)]
pub struct MatchOdds {
    pub home: String,
    pub away: String,
}

/// 市场页面赛事列表项
#[derive(Serialize, Deserialize, Clone)]
pub struct MarketMatchItem {
    pub id: u32,
    pub match_name: String,
    pub league: String,
    pub image: String,
    pub away_image: String,
    pub time: String,
    pub category: String,
    pub odds: MatchOdds,
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
    pub odds: Option<MatchOdds>,
    pub updated_at: String,
}

/// 首页推荐赛事处理器
pub async fn featured_matches_handler(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let db = state.db_service.get_db();

    // 只查询标记为推荐的比赛
    let results = match match_entity::Entity::find()
        .filter(match_entity::Column::IsFeatured.eq(true))
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
                is_featured: m.is_featured,
                embed_url: m.embed_url,
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
        is_featured: m.is_featured,
        embed_url: m.embed_url.clone(),
    };

    // 2.5 获取奖池信息
    let match_pool = match_pool_entity::Entity::find()
        .filter(match_pool_entity::Column::MatchId.eq(m.id))
        .one(db)
        .await
        .ok()
        .flatten();

    // 2.6 计算赔率
    let odds = match &match_pool {
        Some(p) => {
            let total_a = p.total_pool_a;
            let total_b = p.total_pool_b;
            
            if total_a > sea_orm::prelude::Decimal::from(0) && total_b > sea_orm::prelude::Decimal::from(0) {
                let total = total_a + total_b;
                let h = (total / total_a) * sea_orm::prelude::Decimal::from_f64_retain(0.95).unwrap();
                let a = (total / total_b) * sea_orm::prelude::Decimal::from_f64_retain(0.95).unwrap();
                Some(MatchOdds {
                    home: format!("{:.2}", h),
                    away: format!("{:.2}", a),
                })
            } else {
                Some(MatchOdds {
                    home: "1.95".to_string(),
                    away: "1.95".to_string(),
                })
            }
        },
        None => Some(MatchOdds {
            home: "1.95".to_string(),
            away: "1.95".to_string(),
        }),
    };

    // 3. 构造详情对象
    let detail = MatchDetail {
        base,
        winner_id: m.winner_id,
        solana_match_id: m.solana_match_id,
        solana_match_pda: m.solana_match_pda,
        solana_tx_signature: m.solana_tx_signature,
        match_pools: match_pool,
        odds,
        updated_at: m.updated_at.to_string(),
    };

    (StatusCode::OK, Json(ApiResponse::success(detail)))
}

/// 市场页面赛事列表处理器
pub async fn market_matches_handler(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let db = state.db_service.get_db();

    // 查询所有比赛
    let results = match match_entity::Entity::find()
        .all(db)
        .await {
            Ok(matches) => matches,
            Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<Vec<MarketMatchItem>>::error(e.to_string()))),
        };

    let mut market_matches = Vec::new();

    for m in results {
        // 查询战队和奖池信息获取赔率
        let team_a = team_entity::Entity::find_by_id(m.team_a_id).one(db).await;
        let team_b = team_entity::Entity::find_by_id(m.team_b_id).one(db).await;
        let pool = match_pool_entity::Entity::find()
            .filter(match_pool_entity::Column::MatchId.eq(m.id))
            .one(db)
            .await;

        if let (Ok(Some(ta)), Ok(Some(tb))) = (team_a, team_b) {
            // 计算赔率 (简单示例: 基于奖池比例计算，如果没有则默认 1.95)
            let (home_odds, away_odds) = match pool {
                Ok(Some(p)) => {
                    let total_a = p.total_pool_a;
                    let total_b = p.total_pool_b;
                    
                    if total_a > sea_orm::prelude::Decimal::from(0) && total_b > sea_orm::prelude::Decimal::from(0) {
                        // 简单赔率模型: (Total / Self) * 0.95 (5% 手续费)
                        let total = total_a + total_b;
                        let h = (total / total_a) * sea_orm::prelude::Decimal::from_f64_retain(0.95).unwrap();
                        let a = (total / total_b) * sea_orm::prelude::Decimal::from_f64_retain(0.95).unwrap();
                        (format!("{:.2}", h), format!("{:.2}", a))
                    } else {
                        ("1.95".to_string(), "1.95".to_string())
                    }
                },
                _ => ("1.95".to_string(), "1.95".to_string()),
            };

            market_matches.push(MarketMatchItem {
                id: m.id,
                match_name: format!("{} vs {}", ta.name, tb.name),
                league: "Major League".to_string(), // 暂时硬编码
                image: ta.image_url.clone().unwrap_or_default(), // 使用主队 Logo，处理 Option<String>
                away_image: tb.image_url.clone().unwrap_or_default(),
                time: m.start_at.format("%H:%M").to_string(),
                category: "LOL".to_string(), // 暂时硬编码
                odds: MatchOdds {
                    home: home_odds,
                    away: away_odds,
                },
            });
        }
    }

    (StatusCode::OK, Json(ApiResponse::success(market_matches)))
}
