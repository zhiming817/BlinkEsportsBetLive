mod config;
mod controllers;
mod models;
mod services;
mod utils;

use std::sync::Arc;
use config::AppConfig;
use controllers::create_router;
use services::database_service::DatabaseService;
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

    // 构建路由
    let app = create_router(db_service.clone());

    // 启动服务器
    let addr = "0.0.0.0:3000";
    println!("📡 API 服务运行在: http://{}", addr);

    let listener = TcpListener::bind(&addr).await.unwrap();
    serve(listener, app).await.unwrap();
}
