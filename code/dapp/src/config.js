// Solana 合约配置
export const CONTRACT_CONFIG = {
  PROGRAM_ID: 'HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv', // Vault Program ID
  
  // IDL 文件路径（相对于项目根目录）
  IDL_PATH: '/idl/vault_contract_solana.json',
  
  // PDA Seeds
  SEEDS: {
    VAULT_GLOBAL: 'vault_global',
    VAULT: 'vault'
  },
  
  // 指令名称
  INSTRUCTIONS: {
    INITIALIZE: 'initialize',
    CREATE_VAULT: 'createVault',
    UPDATE_VAULT_STATE: 'updateVaultState'
  },
  
  // 事件类型
  EVENT_TYPES: {
    VAULT_CREATED: 'VaultCreatedEvent'
  }
};

// Solana 网络配置
export const NETWORK_CONFIG = {
  // 使用你提供的 RPC URL
  RPC_URL: 'https://api.devnet.solana.com',
  // 或者使用自定义的 RPC
  // RPC_URL: 'https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS',
  NETWORK: 'devnet',
  COMMITMENT: 'confirmed'
};

// 策略配置
export const STRATEGY_OPTIONS = [
  {
    id: 'stable_yield',
    name: 'Stable Yield',
    expectedApy: '8.5%',
    risk: 'Low Risk',
    minInvestment: '$1,000',
    description: 'Conservative strategy focused on stable returns with minimal risk',
    features: ['Capital Preservation', 'Stable Returns', 'Low Volatility']
  },
  {
    id: 'balanced_growth',
    name: 'Balanced Growth',
    expectedApy: '12.5%',
    risk: 'Medium Risk',
    minInvestment: '$5,000',
    description: 'Balanced approach combining stable returns with moderate growth opportunities',
    features: ['Diversified Portfolio', 'Risk Management', 'Growth Potential']
  },
  {
    id: 'high_yield',
    name: 'High Yield',
    expectedApy: '18.5%',
    risk: 'High Risk',
    minInvestment: '$10,000',
    description: 'Aggressive strategy targeting maximum returns through optimized lending',
    features: ['Maximum Returns', 'Dynamic Allocation', 'Advanced Strategies']
  },
  {
    id: 'yield_farming',
    name: 'Yield Farming',
    expectedApy: '16.0%',
    risk: 'Medium Risk',
    minInvestment: '$15,000',
    description: 'Active yield farming strategy across multiple DeFi protocols',
    features: ['Protocol Rotation', 'Liquidity Provision', 'Reward Harvesting']
  },
  {
    id: 'yield_farming_plus',
    name: 'Yield Farming Plus',
    expectedApy: '22.0%',
    risk: 'High Risk',
    minInvestment: '$25,000',
    description: 'Specialized in DeFi yield farming with compound rewards',
    features: ['Compound Interest', 'Liquidity Mining', 'Token Rewards']
  },
  {
    id: 'cross_chain_arbitrage',
    name: 'Cross-Chain Arbitrage',
    expectedApy: '15.5%',
    risk: 'Medium Risk',
    minInvestment: '$50,000',
    description: 'Exploits price differences across different chains and protocols',
    features: ['Price Arbitrage', 'Cross-Chain', 'MEV Protection']
  }
];

// 市场配置
export const MARKET_OPTIONS = [
  {
    id: 'usdc_apt_market',
    name: 'USDC/APT Market',
    supplyApy: '12.5%',
    utilization: '85.2%',
    lltv: '75%',
    tvl: '$2,500,000',
    selected: false
  },
  {
    id: 'usdt_apt_market',
    name: 'USDT/APT Market',
    supplyApy: '11.8%',
    utilization: '78.5%',
    lltv: '80%',
    tvl: '$1,800,000',
    selected: false
  },
  {
    id: 'weth_usdc_market',
    name: 'WETH/USDC Market',
    supplyApy: '8.5%',
    utilization: '92.1%',
    lltv: '85%',
    tvl: '$5,300,000',
    selected: false
  },
  {
    id: 'wbtc_usdt_market',
    name: 'WBTC/USDT Market',
    supplyApy: '7.2%',
    utilization: '88.7%',
    lltv: '80%',
    tvl: '$3,400,000',
    selected: false
  },
  {
    id: 'staked_apt_market',
    name: 'Staked APT Market',
    supplyApy: '14.2%',
    utilization: '65.3%',
    lltv: '70%',
    tvl: '$800,000',
    selected: false
  },
  {
    id: 'stable_lp_token_market',
    name: 'Stable LP Token Market',
    supplyApy: '6.8%',
    utilization: '72.8%',
    lltv: '90%',
    tvl: '$1,500,000',
    selected: false
  }
];

// Guardian 选项
export const GUARDIAN_OPTIONS = [
  {
    id: 'no_guardian',
    name: 'No Guardian',
    description: 'Fast operations, higher risk',
    selected: true
  },
  {
    id: 'multisig_guardian',
    name: 'Multisig Guardian',
    description: 'Multiple signers required for emergency actions',
    selected: false
  },
  {
    id: 'aragon_dao',
    name: 'Aragon DAO',
    description: 'Fully decentralized, token-based governance',
    selected: false
  },
  {
    id: 'custom_guardian',
    name: 'Custom Guardian',
    description: 'Your own guardian contract',
    selected: false
  }
];