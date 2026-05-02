use anchor_lang::prelude::*;
use base64::{Engine as _, engine::general_purpose};
use solana_client::{pubsub_client::PubsubClient, rpc_client::RpcClient, rpc_config::{RpcTransactionLogsConfig, RpcTransactionLogsFilter}};
use solana_sdk::pubkey::Pubkey;
use solana_commitment_config::CommitmentConfig;
use std::str::FromStr;
use std::sync::Arc;
use borsh::{BorshDeserialize, BorshSerialize};
use sha2::{Sha256, Digest};

// 定义事件 Discriminator 计算
fn get_event_discriminator(name: &str) -> [u8; 8] {
    let mut hasher = Sha256::new();
    hasher.update(format!("event:{}", name).as_bytes());
    let result = hasher.finalize();
    let mut discriminator = [0u8; 8];
    discriminator.copy_from_slice(&result[..8]);
    discriminator
}

// 模拟合约中的数据结构
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct MatchPoolAccount {
    pub discriminator: [u8; 8], // Anchor 账号前 8 字节是 Discriminator
    pub match_id: String,
    pub start_time: i64,
    pub total_pool_a: u64,
    pub total_pool_b: u64,
    pub winner: u8,
    pub is_settled: bool,
    pub bump: u8,
}

// 模拟合约中的事件数据结构以便反序列化
#[derive(BorshDeserialize, Debug)]
pub struct MatchInitializedData {
    pub match_id: String,
    pub start_time: i64,
    pub pool_pda: Pubkey,
}

#[derive(BorshDeserialize, Debug)]
pub struct BetPlacedData {
    pub match_id: String,
    pub user: Pubkey,
    pub side: u8,
    pub amount: u64,
}

#[derive(BorshDeserialize, Debug)]
pub struct MatchSettledData {
    pub match_id: String,
    pub winner_side: u8,
    pub total_pool_a: u64,
    pub total_pool_b: u64,
}

#[derive(BorshDeserialize, Debug)]
pub struct PrizeClaimedData {
    pub match_id: String,
    pub user: Pubkey,
    pub amount: u64,
}

use crate::services::match_service::MatchService;
use sea_orm::*;

pub struct EventListener {
    program_id: Pubkey,
    ws_url: String,
    rpc_url: String,
    match_service: Arc<MatchService>,
}

impl EventListener {
    pub fn new(program_id_str: &str, ws_url: &str, rpc_url: &str, match_service: Arc<MatchService>) -> Self {
        Self {
            program_id: Pubkey::from_str(program_id_str).unwrap(),
            ws_url: ws_url.to_string(),
            rpc_url: rpc_url.to_string(),
            match_service,
        }
    }

    /// 演示如何主动从链上获取 MatchPool 账号数据
    pub async fn fetch_match_pool(&self, pda_str: &str) -> anyhow::Result<MatchPoolAccount> {
        let rpc_client = RpcClient::new(self.rpc_url.clone());
        let pubkey = Pubkey::from_str(pda_str)?;
        
        let account_data = rpc_client.get_account_data(&pubkey)?;
        
        // 调试：打印账号数据长度
        println!("🔍 [调试] 账号数据实际长度: {} bytes", account_data.len());
        
        let mut data_ptr = &account_data[..];
        let match_pool = MatchPoolAccount::deserialize(&mut data_ptr)
            .map_err(|e| anyhow::anyhow!("反序列化 MatchPool 失败: {}", e))?;
        
        Ok(match_pool)
    }

pub async fn start_listening(&self) -> anyhow::Result<()> {
        println!("🚀 [DEBUG] 开始订阅日志... WS: {}, Program: {}", self.ws_url, self.program_id);
        
        let (mut _subscription_receiver, mut stream) = match PubsubClient::logs_subscribe(
            &self.ws_url,
            RpcTransactionLogsFilter::Mentions(vec![self.program_id.to_string()]),
            RpcTransactionLogsConfig {
                commitment: Some(CommitmentConfig::processed()),
            },
        ) {
            Ok(res) => res,
            Err(e) => {
                eprintln!("❌ [CRITICAL] 订阅失败: {:?}", e);
                return Err(anyhow::anyhow!("订阅失败: {}", e));
            }
        };

        println!("✅ [DEBUG] 订阅成功，等待事件中...");

        // 预计算 Discriminators
        let match_init_disc = get_event_discriminator("MatchInitialized");
        let bet_placed_disc = get_event_discriminator("BetPlaced");
        let match_settled_disc = get_event_discriminator("MatchSettled");
        let prize_claimed_disc = get_event_discriminator("PrizeClaimed");

        loop {
            match stream.recv() {
                Ok(log) => {
                    println!("📥 接收到新日志 (Sig: {})", log.value.signature);
                    for line in log.value.logs {
                        if let Some(data_index) = line.find("Program data: ") {
                            let b64_data = &line[data_index + 14..];
                            if let Ok(data) = general_purpose::STANDARD.decode(b64_data) {
                                if data.len() < 8 { continue; }
                                let disc = &data[..8];
                                let content = &data[8..];

                                if disc == match_init_disc {
                                    if let Ok(event) = MatchInitializedData::try_from_slice(&content) {
                                        let signature = log.value.signature.clone();
                                        let match_id = event.match_id.clone();
                                        let match_pda = event.pool_pda.to_string();
                                        
                                        println!("🔥 比赛初始化事件: MatchID={}, StartTime={}, Sig={}", match_id, event.start_time, signature);
                                        
                                        if let Err(e) = self.match_service.update_solana_info(
                                            &match_id,
                                            match_id.clone(),
                                            match_pda.clone(),
                                            signature
                                        ).await {
                                            eprintln!("❌ 同步比赛到数据库失败: {}", e);
                                        } else {
                                            println!("✅ 比赛数据库记录已更新 (via MatchService)");
                                        }
                                    }
                                } else if disc == bet_placed_disc {
                                    if let Ok(event) = BetPlacedData::try_from_slice(&content) {
                                        let signature = log.value.signature.clone();
                                        println!("💰 下注事件: MatchID={}, User={}, Side={}, Amount={}, Sig={}", 
                                            event.match_id, event.user, event.side, event.amount, signature);
                                        
                                        if let Err(e) = self.match_service.handle_bet_placed(
                                            &event.match_id,
                                            event.user.to_string(),
                                            event.side,
                                            event.amount,
                                            signature
                                        ).await {
                                            eprintln!("❌ 更新下注记录失败: {}", e);
                                        }
                                    }
                                } else if disc == match_settled_disc {
                                    if let Ok(event) = MatchSettledData::try_from_slice(&content) {
                                        println!("结算事件: MatchID={}, WinnerSide={}", event.match_id, event.winner_side);
                                        if let Err(e) = self.match_service.settle_match(
                                            &event.match_id,
                                            event.winner_side
                                        ).await {
                                            eprintln!("❌ 结算比赛失败: {}", e);
                                        }
                                    }
                                } else if disc == prize_claimed_disc {
                                    if let Ok(event) = PrizeClaimedData::try_from_slice(&content) {
                                        println!("🏆 领奖事件: MatchID={}, User={}, Amount={}", event.match_id, event.user, event.amount);
                                    }
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("⚠️ [DEBUG] Stream 断开或超时: {:?}. 正在尝试重新连接...", e);
                    // 实际生产环境这里应该加入重连逻辑，目前先打印错误
                    break;
                }
            }
        }
        Ok(())
    }

    async fn handle_event_data(&self, data: &[u8]) {
        if data.len() < 8 { return; }
        let discriminator = &data[..8];
        println!("Received event with discriminator: {:?}", discriminator);
    }
}
