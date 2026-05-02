use axum::{
    extract::{Query, State},
    Json,
};
use serde::{Deserialize, Serialize};
use crate::controllers::http_controller::AppState;

#[derive(Serialize, Deserialize)]
pub struct ActionGetResponse {
    pub icon: String,
    pub title: String,
    pub description: String,
    pub label: String,
    pub links: ActionLinks,
}

#[derive(Serialize, Deserialize)]
pub struct ActionLinks {
    pub actions: Vec<ActionElement>,
}

#[derive(Serialize, Deserialize)]
pub struct ActionElement {
    pub label: String,
    pub href: String,
    pub parameters: Option<Vec<ActionParameter>>,
}

#[derive(Serialize, Deserialize)]
pub struct ActionParameter {
    pub name: String,
    pub label: String,
}

#[derive(Deserialize)]
pub struct ActionPostRequest {
    pub account: String,
}

#[derive(Serialize)]
pub struct ActionPostResponse {
    pub transaction: String,
    pub message: String,
}

#[derive(Deserialize)]
pub struct ActionParams {
    pub match_id: String,
}

#[derive(Deserialize)]
pub struct BetParams {
    pub match_id: String,
    pub side: u8,
}

/// GET /api/actions/bet?match_id=xxx
/// 返回 Blink 的元数据
pub async fn get_action_handler(
    State(_state): State<AppState>,
    Query(params): Query<ActionParams>,
) -> Json<ActionGetResponse> {
    // 实际项目中这里应该从数据库查询赛事详情
    let title = format!("BlinkBet: 赛事预测 #{}", params.match_id);
    let description = "谁将赢得这场比赛？直接在下方选择并下注 SOL。".to_string();
    
    Json(ActionGetResponse {
        icon: "https://blinkbet.live/logo.png".to_string(), // 替换为实际图标
        title,
        description,
        label: "下注".to_string(),
        links: ActionLinks {
            actions: vec![
                ActionElement {
                    label: "支持左队 (Home)".to_string(),
                    href: format!("/api/actions/bet?match_id={}&side=1", params.match_id),
                    parameters: None,
                },
                ActionElement {
                    label: "支持右队 (Away)".to_string(),
                    href: format!("/api/actions/bet?match_id={}&side=2", params.match_id),
                    parameters: None,
                },
            ],
        },
    })
}

/// POST /api/actions/bet?match_id=xxx&side=x
/// 构造并返回 Solana 交易
pub async fn post_action_handler(
    State(_state): State<AppState>,
    Query(params): Query<BetParams>,
    Json(payload): Json<ActionPostRequest>,
) -> Json<ActionPostResponse> {
    // 这里是核心逻辑：
    // 1. 解析 payload.account (用户的钱包地址)
    // 2. 使用 anchor_client 构造 blink_bet_contract::place_bet 的交易
    // 3. 将交易序列化为 Base64
    
    let user_pubkey = payload.account;
    let _match_id = params.match_id;
    let _side = params.side;

    // TODO: 实现具体的交易构造逻辑
    // 暂时返回一个 Mock 响应
    Json(ActionPostResponse {
        transaction: "BASE64_ENCODED_TRANSACTION_HERE".to_string(),
        message: format!("已为钱包 {} 准备好下注交易", user_pubkey),
    })
}
