mod config;
mod controllers;
mod models;
mod services;
mod utils;
mod router;

use std::sync::Arc;
use config::AppConfig;
use services::database_service::DatabaseService;
use services::match_service::MatchService;
use services::event_listener::EventListener;
use axum::serve;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    println!("🚀 启动 BlinkBet 后端服务...\n");

    // 解析命令行参数获取配置文件路径
    let args: Vec<String> = std::env::args().collect();
    let config_path = {
        let mut path = String::from("config.yaml");
        for i in 0..args.len() {
            if args[i] == "--config" && i + 1 < args.len() {
                path = args[i + 1].clone();
                break;
            }
        }
        path
    };

    // 加载配置
    let config = AppConfig::from_yaml_with_env(&config_path);
    
    // 初始化数据库
    let db_service = DatabaseService::new(&config.database)
        .await
        .expect("无法连接到数据库");
    
    let db_service = Arc::new(db_service);

    // 初始化 MatchService
    let match_service = Arc::new(MatchService::new(db_service.clone()));

    // 启动 Solana 事件监听器
    let listener_match_service = Arc::clone(&match_service);
    let rpc_url = config.get_rpc_url().to_string();
    let ws_url = config.get_wss_url().map(|s| s.to_string()).unwrap_or_else(|| {
        rpc_url.replace("https://", "wss://").replace("http://", "ws://")
    });
    let program_id = config.program_id.clone();
    
    tokio::spawn(async move {
        let listener = EventListener::new(
            &program_id,
            &ws_url,
            &rpc_url,
            listener_match_service
        );
        println!("📡 监听合约事件: {}", program_id);
        if let Err(e) = listener.start_listening().await {
            eprintln!("❌ 事件监听器出错: {}", e);
        }
    });

    // 构建路由
    let app = router::init_router(db_service.clone());

    // 启动服务器
    let addr = "0.0.0.0:3000";
    println!("📡 API 服务运行在: http://{}", addr);

    let listener = TcpListener::bind(&addr).await.unwrap();
    serve(listener, app).await.unwrap();
}
