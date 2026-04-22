use sea_orm::*;
use std::time::Duration;
use crate::config::DatabaseConfig;

/// 数据库服务 - 使用 SeaORM
pub struct DatabaseService {
    db: DatabaseConnection,
}

impl DatabaseService {
    /// 创建新的数据库服务实例
    pub async fn new(config: &DatabaseConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let database_url = match config.db_type.as_str() {
            "sqlite" => {
                let sqlite_path = config.sqlite_path.as_ref()
                    .ok_or("SQLite path not configured")?;
                
                if let Some(parent) = std::path::Path::new(sqlite_path).parent() {
                    std::fs::create_dir_all(parent)?;
                }
                
                format!("sqlite:{}?mode=rwc", sqlite_path)
            }
            "mysql" => {
                let host = config.mysql_host.as_ref().ok_or("MySQL host not configured")?;
                let port = config.mysql_port.ok_or("MySQL port not configured")?;
                let user = config.mysql_user.as_ref().ok_or("MySQL user not configured")?;
                let password = config.mysql_password.as_ref().ok_or("MySQL password not configured")?;
                let database = config.mysql_database.as_ref().ok_or("MySQL database not configured")?;
                
                format!("mysql://{}:{}@{}:{}/{}", user, password, host, port, database)
            }
            _ => return Err("Unsupported database type".into()),
        };

        let mut opt = ConnectOptions::new(database_url);
        opt.max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .connect_timeout(Duration::from_secs(8));

        let db = Database::connect(opt).await?;
        
        Ok(Self { db })
    }

    /// 获取数据库连接
    pub fn get_db(&self) -> &DatabaseConnection {
        &self.db
    }
}
