use axum::{
    extract::{State, Query},
    Json,
};
use serde::Deserialize;
use crate::controllers::http_controller::{AppState, ApiResponse};
use crate::services::PandascoreService;

#[derive(Deserialize)]
pub struct SyncMatchesParams {
    pub league_id: Option<u32>,
}

#[derive(Deserialize)]
pub struct SyncSingleMatchParams {
    pub match_id: u32,
}

pub async fn sync_matches_handler(
    State(state): State<AppState>,
    Query(query): Query<SyncMatchesParams>,
) -> Json<ApiResponse<String>> {
    let config_result = crate::config::AppConfig::from_yaml("config.yaml")
        .map_err(|e| e.to_string());

    let ps_config = match config_result {
        Err(e) => return Json(ApiResponse::error(format!("Failed to load config: {}", e))),
        Ok(cfg) => match cfg.pandascore {
            None => return Json(ApiResponse::error("Pandascore API is not configured in config.yaml".to_string())),
            Some(ps_config) => ps_config,
        },
    };

    let league_id = query.league_id.or(Some(ps_config.default_league_id));
    let ps_service = PandascoreService::new(state.db_service.clone(), ps_config);

    match ps_service.sync_upcoming_matches(league_id).await {
        Ok(count) => Json(ApiResponse::success(format!("Successfully synced {} matches", count))),
        Err(e) => Json(ApiResponse::error(format!("Sync failed: {}", e))),
    }
}

pub async fn sync_single_match_handler(
    State(state): State<AppState>,
    Query(query): Query<SyncSingleMatchParams>,
) -> Json<ApiResponse<String>> {
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

    match ps_service.sync_single_match(query.match_id).await {
        Ok(_) => Json(ApiResponse::success(format!("Successfully synced match {}", query.match_id))),
        Err(e) => Json(ApiResponse::error(format!("Sync match {} failed: {}", query.match_id, e))),
    }
}
