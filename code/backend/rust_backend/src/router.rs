use axum::{
    routing::get,
    Router as AxumRouter,
};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};

use crate::controllers::{http_controller, match_controller, user_controller, admin_controller};
use crate::controllers::http_controller::AppState;
use crate::services::database_service::DatabaseService;

/// 初始化所有路由配置
pub fn init_router(db_service: Arc<DatabaseService>) -> AxumRouter {
    let state = AppState { db_service };

    // 配置 CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    AxumRouter::new()
        // 基础路由
        .route("/", get(http_controller::root_handler))
        .route("/health", get(http_controller::health_handler))
        
        // 赛事相关路由
        .route("/api/matches/featured", get(match_controller::featured_matches_handler))
        .route("/api/matches/market", get(match_controller::market_matches_handler))
        .route("/api/matches/{id}", get(match_controller::get_match_detail_handler))
        
        // 同步赛事数据 (管理接口)
        .route("/api/admin/sync-matches", get(admin_controller::sync_matches_handler))
        .route("/api/admin/sync-match", get(admin_controller::sync_single_match_handler))
        
        // 用户相关路由
        .route("/api/user/bets", get(user_controller::get_user_bets_handler))
        
        // 补充中间件和状态
        .layer(cors)
        .with_state(state)
}
