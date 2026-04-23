use anchor_lang::prelude::*;
use base64::{Engine as _, engine::general_purpose};
use solana_client::{pubsub_client::PubsubClient, rpc_client::RpcClient, rpc_config::{RpcTransactionLogsConfig, RpcTransactionLogsFilter}};
use solana_sdk::pubkey::Pubkey;
use solana_commitment_config::CommitmentConfig;
use std::str::FromStr;
use std::sync::Arc;
use crate::services::DatabaseService;
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

use crate::models::match_entity;
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
        
        // 使用锚点合约数据反序列化时，Anchor 通常会在末尾保留一些空间或有填充
        // Borsh Deserialize 要求字节数必须完全匹配。如果数据有多余字节，会报 "Not all bytes read"。
        // 我们改为使用 BorshDeserialize 提供的更底层的接口，或者直接手动切片直到消费完数据。
        let mut data_ptr = &account_data[..];
        let match_pool = MatchPoolAccount::deserialize(&mut data_ptr)
            .map_err(|e| anyhow::anyhow!("反序列化 MatchPool 失败: {}", e))?;
        
        Ok(match_pool)
    }

    pub async fn start_listening(&self) -> anyhow::Result<()> {
        let (mut _subscription_receiver, stream) = PubsubClient::logs_subscribe(
            &self.ws_url,
            RpcTransactionLogsFilter::Mentions(vec![self.program_id.to_string()]),
            RpcTransactionLogsConfig {
                commitment: Some(CommitmentConfig::confirmed()),
            },
        )?;

        // 预计算 Discriminators
        let match_init_disc = get_event_discriminator("MatchInitialized");
        let bet_placed_disc = get_event_discriminator("BetPlaced");
        let match_settled_disc = get_event_discriminator("MatchSettled");
        let prize_claimed_disc = get_event_discriminator("PrizeClaimed");

        while let Ok(log) = stream.recv() {
            println!("📥 接收到新日志 (Sig: {})", log.value.signature);
            for line in log.value.logs {
                // 打印每一行日志以便观察
                println!("  [LOG] {}", line);
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
                                
                                // 使用 MatchService 同步到数据库
                                if let Err(e) = self.match_service.update_solana_info(
                                    &match_id,
                                    match_id.clone(),
                                    match_pda.clone(),
                                    signature
                                ).await {
                                    eprintln!("❌ 同步比赛到数据库失败: {}", e);
                                } else {
                                    println!("✅ 比赛数据库记录已更新 (via MatchService)");
                                    
                                    // --- 测试代码: 初始化后立即抓取链上数据校验 ---
                                    if let Ok(pool_on_chain) = self.fetch_match_pool(&match_pda).await {
                                        println!("🧪 [测试] 链上校验成功! MatchID: {}, TotalA: {}", 
                                            pool_on_chain.match_id, pool_on_chain.total_pool_a);
                                    }
                                    // ------------------------------------------
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

                                // --- 测试代码: 下注后抓取链上奖池状态 ---
                                let db = self.match_service.get_db();
                                let numeric_id = event.match_id.replace("match_", "").parse::<u32>().unwrap_or(0);
                                println!("🔍 [调试] 正在查询奖池记录, MatchId: {}", numeric_id);
                                
                                match crate::models::match_pool_entity::Entity::find()
                                    .filter(crate::models::match_pool_entity::Column::MatchId.eq(numeric_id))
                                    .one(db).await {
                                    Ok(Some(pool_record)) => {
                                        println!("🔍 [调试] 找到 PDA: {}, 开始请求 RPC...", pool_record.pda_address);
                                        match self.fetch_match_pool(&pool_record.pda_address).await {
                                            Ok(pool_on_chain) => {
                                                println!("🧪 [下注测试] 链上奖池校验: TotalA={}, TotalB={}", 
                                                    pool_on_chain.total_pool_a, pool_on_chain.total_pool_b);
                                            },
                                            Err(e) => eprintln!("❌ [调试] RPC 请求失败: {}", e),
                                        }
                                    },
                                    Ok(None) => println!("⚠️ [调试] 数据库中未找到 MatchId 为 {} 的奖池记录", numeric_id),
                                    Err(e) => eprintln!("❌ [调试] 数据库查询出错: {}", e),
                                }
                                // ------------------------------------------
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

        Ok(())
    }

    async fn handle_event_data(&self, data: &[u8]) {
        if data.len() < 8 {
            return;
        }

        let discriminator = &data[..8];
        let _event_data = &data[8..];

        // 这里可以通过比较 discriminator 来确定是哪个事件
        // 由于 Discriminator 是由 sha256("event:EventName")[..8] 计算的
        // 后续可以在这里添加具体的 match 分支
        println!("Received event with discriminator: {:?}", discriminator);
    }
}
