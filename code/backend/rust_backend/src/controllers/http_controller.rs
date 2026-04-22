use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Router,
    routing::get,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use sea_orm::*;

use crate::services::database_service::DatabaseService;
use crate::models::{match_entity, team_entity};

/// HTTP 服务器状态
#[derive(Clone)]
pub struct AppState {
    pub db_service: Arc<DatabaseService>,
}

/// 首页赛事列表项
#[derive(Serialize, Deserialize)]
pub struct HomeMatchItem {
    pub id: u32,
    pub team_a: team_entity::Model,
    pub team_b: team_entity::Model,
    pub start_at: String,
    pub status: String,
    pub number_of_games: i32,
}

/// API 响应结构
#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

/// 创建 HTTP 路由
pub fn create_router(db_service: Arc<DatabaseService>) -> Router {
    let state = AppState { db_service };

    // 配置 CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .route("/api/matches/featured", get(featured_matches_handler))
        .layer(cors)
        .with_state(state)
}

/// 首页推荐赛事处理器
async fn featured_matches_handler(
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

/// 根路径处理器
async fn root_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "BlinkBet API",
        "version": "0.1.0",
        "status": "online"
    }))
}

/// 健康检查处理器
async fn health_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

