use axum::{
    extract::{State, Query},
    Json,
};
use serde::Deserialize;
use crate::controllers::http_controller::{AppState, ApiResponse};
use crate::services::PandascoreService;

#[derive(Deserialize)]
pub struct SyncParams {
    pub league_id: Option<u32>,
}

pub async fn sync_matches_handler(
    State(state): State<AppState>,
    Query(query): Query<SyncParams>,
) -> Json<ApiResponse<String>> {
    // 重新加载配置以获取 API Token（在 await 之前完成，避免非 Send 类型跨越 await 点）
    let config_result = crate::config::AppConfig::from_yaml("config.yaml")
        .map_err(|e| e.to_string());

    let ps_config = match config_result {
        Err(e) => return Json(ApiResponse::error(format!("Failed to load config: {}", e))),
        Ok(cfg) => match cfg.pandascore {
            None => return Json(ApiResponse::error("Pandascore API is not configured in config.yaml".to_string())),
            Some(ps_config) => ps_config,
        },
    };

    let ps_service = PandascoreService::new(state.db_service.clone(), ps_config);

    match ps_service.sync_upcoming_matches(query.league_id).await {
        Ok(count) => Json(ApiResponse::success(format!("Successfully synced {} matches", count))),
        Err(e) => Json(ApiResponse::error(format!("Sync failed: {}", e))),
    }
}
