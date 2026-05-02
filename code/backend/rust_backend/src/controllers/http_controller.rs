use axum::{
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::services::database_service::DatabaseService;

/// HTTP 服务器状态
#[derive(Clone)]
pub struct AppState {
    pub db_service: Arc<DatabaseService>,
    pub config: crate::config::AppConfig,
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

/// 根路径处理器
pub async fn root_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "BlinkBet API",
        "version": "0.1.0",
        "status": "online"
    }))
}

/// 健康检查处理器
pub async fn health_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

