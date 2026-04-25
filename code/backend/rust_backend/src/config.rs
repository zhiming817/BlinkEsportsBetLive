use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// 网络类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Network {
    /// 主网
    Mainnet,
    /// 开发网
    Devnet,
    /// 测试网
    Testnet,
}

impl Network {
    /// 从字符串解析网络类型
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "mainnet" | "mainnet-beta" => Some(Self::Mainnet),
            "devnet" => Some(Self::Devnet),
            "testnet" => Some(Self::Testnet),
            _ => None,
        }
    }
}

/// 监听模式
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ListenerMode {
    /// 轮询模式 (默认)
    Polling,
    /// WebSocket 模式
    WebSocket,
}

impl ListenerMode {
    /// 从字符串解析监听模式
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "websocket" | "ws" => Self::WebSocket,
            _ => Self::Polling,
        }
    }
}

/// 事件解析模式
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EventParseMode {
    /// 仅解析 CreateEvent
    Create,
    /// 仅解析 TradeEvent
    Trade,
    /// 解析所有事件
    Both,
    /// 不解析任何事件
    None,
}

impl EventParseMode {
    /// 从字符串解析事件解析模式
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "create" => Self::Create,
            "trade" => Self::Trade,
            "both" | "all" => Self::Both,
            "none" => Self::None,
            _ => Self::Both, // 默认解析所有
        }
    }

    /// 判断是否需要解析 CreateEvent
    pub fn should_parse_create(&self) -> bool {
        matches!(self, Self::Create | Self::Both)
    }

    /// 判断是否需要解析 TradeEvent
    pub fn should_parse_trade(&self) -> bool {
        matches!(self, Self::Trade | Self::Both)
    }
}

/// RPC 端点配置
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RpcEndpoint {
    /// RPC URL (HTTP/HTTPS)
    pub rpc_url: String,
    /// WebSocket URL (可选)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wss_url: Option<String>,
}

/// YAML 配置文件结构
#[derive(Debug, Deserialize, Serialize)]
struct YamlConfig {
    solana: SolanaConfig,
    vault: VaultConfig,
    listener: ListenerConfig,
    database: DatabaseConfig,
    pandascore: Option<PandascoreConfig>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PandascoreConfig {
    pub api_url: String,
    pub api_token: String,
    pub default_league_id: u32,
}

#[derive(Debug, Deserialize, Serialize)]
struct SolanaConfig {
    /// 当前激活的网络
    active_network: Network,
    /// 多个网络的 RPC 端点配置
    networks: HashMap<Network, RpcEndpoint>,
}

#[derive(Debug, Deserialize, Serialize)]
struct VaultConfig {
    program_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct ListenerConfig {
    mode: ListenerMode,
    poll_interval_secs: u64,
    #[serde(default = "default_event_parse_mode")]
    event_parse: EventParseMode,
}

fn default_event_parse_mode() -> EventParseMode {
    EventParseMode::Both
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DatabaseConfig {
    #[serde(rename = "type")]
    pub db_type: String,
    pub sqlite_path: Option<String>,
    pub postgres_url: Option<String>,
    pub mysql_host: Option<String>,
    pub mysql_port: Option<u16>,
    pub mysql_user: Option<String>,
    pub mysql_password: Option<String>,
    pub mysql_database: Option<String>,
    pub max_connections: u32,
    pub min_connections: u32,
}

/// 应用配置
pub struct AppConfig {
    /// 当前激活的网络
    pub active_network: Network,
    /// 所有网络的 RPC 端点配置
    pub networks: HashMap<Network, RpcEndpoint>,
    /// Vault 合约程序 ID
    pub program_id: String,
    /// 轮询间隔（秒）
    pub poll_interval_secs: u64,
    /// 监听模式
    pub listener_mode: ListenerMode,
    /// 事件解析模式
    pub event_parse_mode: EventParseMode,
    /// 数据库配置
    pub database: DatabaseConfig,
    /// Pandascore API 配置
    pub pandascore: Option<PandascoreConfig>,
}

impl AppConfig {
    /// 获取当前激活网络的 RPC URL
    pub fn get_rpc_url(&self) -> &str {
        self.networks
            .get(&self.active_network)
            .map(|endpoint| endpoint.rpc_url.as_str())
            .unwrap_or("https://api.devnet.solana.com")
    }

    /// 获取当前激活网络的 WebSocket URL
    pub fn get_wss_url(&self) -> Option<&str> {
        self.networks
            .get(&self.active_network)
            .and_then(|endpoint| endpoint.wss_url.as_deref())
    }

    /// 切换网络
    pub fn switch_network(&mut self, network: Network) {
        if self.networks.contains_key(&network) {
            self.active_network = network;
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        let mut networks = HashMap::new();
        
        // 默认开发网配置
        networks.insert(
            Network::Devnet,
            RpcEndpoint {
                rpc_url: "https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048".to_string(),
                wss_url: None,
            },
        );

        Self {
            active_network: Network::Devnet,
            networks,
            program_id: "HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv".to_string(),
            poll_interval_secs: 5,
            listener_mode: ListenerMode::Polling,
            event_parse_mode: EventParseMode::Both,
            database: DatabaseConfig {
                db_type: "sqlite".to_string(),
                sqlite_path: Some("data/events.db".to_string()),
                postgres_url: None,
                mysql_host: None,
                mysql_port: None,
                mysql_user: None,
                mysql_password: None,
                mysql_database: None,
                max_connections: 5,
                min_connections: 1,
            },
            pandascore: None,
        }
    }
}

impl AppConfig {
    /// 从 YAML 文件加载配置
    ///
    /// # Arguments
    /// * `config_path` - YAML 配置文件路径
    ///
    /// # Example
    /// ```rust,ignore
    /// let config = AppConfig::from_yaml("config.yaml")?;
    /// ```
    pub fn from_yaml<P: AsRef<Path>>(config_path: P) -> Result<Self, Box<dyn std::error::Error>> {
        let config_str = fs::read_to_string(config_path)?;
        let yaml_config: YamlConfig = serde_yaml::from_str(&config_str)?;

        Ok(Self {
            active_network: yaml_config.solana.active_network,
            networks: yaml_config.solana.networks,
            program_id: yaml_config.vault.program_id,
            poll_interval_secs: yaml_config.listener.poll_interval_secs,
            listener_mode: yaml_config.listener.mode,
            event_parse_mode: yaml_config.listener.event_parse,
            database: yaml_config.database,
            pandascore: yaml_config.pandascore,
        })
    }

    /// 从 YAML 文件加载配置，如果失败则使用默认配置
    ///
    /// # Arguments
    /// * `config_path` - YAML 配置文件路径
    pub fn from_yaml_or_default<P: AsRef<Path>>(config_path: P) -> Self {
        match Self::from_yaml(config_path.as_ref()) {
            Ok(config) => {
                println!("✅ 已加载配置文件: {:?}", config_path.as_ref());
                config
            }
            Err(e) => {
                eprintln!("⚠️  无法加载配置文件 {:?}: {}", config_path.as_ref(), e);
                println!("📋 使用默认配置");
                Self::default()
            }
        }
    }

    /// 从环境变量创建配置（环境变量会覆盖 YAML 配置）
    pub fn from_env() -> Self {
        let mut config = Self::default();

        if let Ok(rpc_url) = std::env::var("SOLANA_RPC_URL") {
            // 如果设置了环境变量的 RPC URL，更新当前激活网络的配置
            if let Some(endpoint) = config.networks.get_mut(&config.active_network) {
                endpoint.rpc_url = rpc_url;
            }
        }

        if let Ok(network) = std::env::var("SOLANA_NETWORK") {
            if let Some(net) = Network::from_str(&network) {
                config.active_network = net;
            }
        }

        if let Ok(program_id) = std::env::var("VAULT_PROGRAM_ID") {
            config.program_id = program_id;
        }

        if let Ok(interval) = std::env::var("POLL_INTERVAL_SECS") {
            if let Ok(secs) = interval.parse() {
                config.poll_interval_secs = secs;
            }
        }

        if let Ok(mode) = std::env::var("LISTENER_MODE") {
            config.listener_mode = ListenerMode::from_str(&mode);
        }

        if let Ok(event_parse) = std::env::var("EVENT_PARSE") {
            config.event_parse_mode = EventParseMode::from_str(&event_parse);
        }

        config
    }

    /// 从 YAML 文件加载配置，然后用环境变量覆盖
    ///
    /// 优先级：环境变量 > YAML 文件 > 默认值
    ///
    /// # Arguments
    /// * `config_path` - YAML 配置文件路径
    pub fn from_yaml_with_env<P: AsRef<Path>>(config_path: P) -> Self {
        // 先从 YAML 加载
        let mut config = Self::from_yaml_or_default(config_path);

        // 环境变量覆盖 RPC URL
        if let Ok(rpc_url) = std::env::var("SOLANA_RPC_URL") {
            println!("🔄 环境变量覆盖 RPC URL");
            if let Some(endpoint) = config.networks.get_mut(&config.active_network) {
                endpoint.rpc_url = rpc_url;
            }
        }

        // 环境变量覆盖激活网络
        if let Ok(network) = std::env::var("SOLANA_NETWORK") {
            if let Some(net) = Network::from_str(&network) {
                if config.networks.contains_key(&net) {
                    println!("🔄 环境变量覆盖激活网络: {:?}", net);
                    config.active_network = net;
                }
            }
        }

        if let Ok(program_id) = std::env::var("VAULT_PROGRAM_ID") {
            println!("🔄 环境变量覆盖 Program ID");
            config.program_id = program_id;
        }

        if let Ok(interval) = std::env::var("POLL_INTERVAL_SECS") {
            if let Ok(secs) = interval.parse() {
                println!("🔄 环境变量覆盖轮询间隔");
                config.poll_interval_secs = secs;
            }
        }

        if let Ok(mode) = std::env::var("LISTENER_MODE") {
            println!("🔄 环境变量覆盖监听模式");
            config.listener_mode = ListenerMode::from_str(&mode);
        }

        if let Ok(event_parse) = std::env::var("EVENT_PARSE") {
            println!("🔄 环境变量覆盖事件解析模式");
            config.event_parse_mode = EventParseMode::from_str(&event_parse);
        }

        config
    }
}
