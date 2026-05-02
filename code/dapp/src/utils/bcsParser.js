import { bcs } from '@mysten/sui/bcs';

/**
 * 定义 Vault 相关的 BCS 结构
 * 根据 types.move 中的定义
 */

// VaultStrategy 结构
const VaultStrategy = bcs.struct('VaultStrategy', {
  name: bcs.string(),
  description: bcs.string(),
  risk_level: bcs.u8(),
  supported_tokens: bcs.vector(bcs.string()),
  strategy_type: bcs.string(),
  min_duration: bcs.u64(),
  max_duration: bcs.u64(),
  auto_compound: bcs.bool(),
  emergency_exit: bcs.bool(),
});

// MarketAllocation 结构
const MarketAllocation = bcs.struct('MarketAllocation', {
  market_address: bcs.string(),
  allocation_percentage: bcs.u64(),
});

// VaultConfiguration 结构
const VaultConfiguration = bcs.struct('VaultConfiguration', {
  name: bcs.string(),
  symbol: bcs.string(),
  description: bcs.string(),
  strategy: bcs.string(),
  curator: bcs.string(),
  timelock: bcs.u64(),
  guardian: bcs.option(bcs.string()),
  fee_rate: bcs.u64(),
  performance_fee: bcs.u64(),
  markets: bcs.vector(bcs.string()),
  allocations: bcs.vector(MarketAllocation),
});

// VaultState 结构
const VaultState = bcs.struct('VaultState', {
  apy: bcs.u64(),
  current_apy: bcs.u64(),
  total_assets: bcs.u64(),
  total_assets_usd: bcs.u64(),
  total_supply: bcs.u64(),
  share_price: bcs.u64(),
  performance_fee_collected: bcs.u64(),
});

// Allocation 结构
const Allocation = bcs.struct('Allocation', {
  market_address: bcs.Address,
  supply_assets: bcs.u64(),
  supply_assets_usd: bcs.u64(),
  expected_apy: bcs.u64(),
});

// Vault 结构
const VaultBCS = bcs.struct('Vault', {
  id: bcs.u64(),
  creator: bcs.Address,
  strategy: VaultStrategy,
  configuration: VaultConfiguration,
  state: VaultState,
  allocations: bcs.vector(Allocation),
});

// Option<Vault> 结构
const OptionVault = bcs.option(VaultBCS);

/**
 * 解析 Vault BCS 数据
 * @param {Uint8Array} data - BCS 编码的数据
 * @returns {Object|null} 解析后的 Vault 对象,如果是 None 则返回 null
 */
export function parseVaultBCS(data) {
  try {
    console.log('🔍 Parsing BCS data:', data);
    
    // 如果 data 是数组,转换为 Uint8Array
    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
    
    // 解析 Option<Vault>
    const optionVault = OptionVault.parse(uint8Data);
    
    console.log('📦 Parsed option vault:', optionVault);
    
    // 如果是 None,返回 null
    if (!optionVault) {
      return null;
    }
    
    // 转换数据格式,便于前端使用
    const vault = formatVaultData(optionVault);
    
    console.log('✅ Formatted vault data:', vault);
    
    return vault;
  } catch (error) {
    console.error('❌ Error parsing BCS data:', error);
    throw error;
  }
}

/**
 * 格式化 Vault 数据,转换为前端友好的格式
 * @param {Object} rawVault - 原始解析的 Vault 数据
 * @returns {Object} 格式化后的数据
 */
function formatVaultData(rawVault) {
  return {
    // 基本信息
    id: Number(rawVault.id),
    creator: rawVault.creator,
    
    // 策略信息
    strategy: {
      name: rawVault.strategy.name,
      description: rawVault.strategy.description,
      riskLevel: rawVault.strategy.risk_level,
      riskLevelText: getRiskLevelText(rawVault.strategy.risk_level),
      supportedTokens: rawVault.strategy.supported_tokens,
      strategyType: rawVault.strategy.strategy_type,
      minDuration: Number(rawVault.strategy.min_duration),
      maxDuration: Number(rawVault.strategy.max_duration),
      autoCompound: rawVault.strategy.auto_compound,
      emergencyExit: rawVault.strategy.emergency_exit,
    },
    
    // 配置信息
    configuration: {
      name: rawVault.configuration.name,
      symbol: rawVault.configuration.symbol,
      description: rawVault.configuration.description,
      strategy: rawVault.configuration.strategy,
      curator: rawVault.configuration.curator,
      timelock: Number(rawVault.configuration.timelock),
      timelockDays: Number(rawVault.configuration.timelock),
      guardian: rawVault.configuration.guardian || null,
      feeRate: Number(rawVault.configuration.fee_rate),
      feeRatePercent: (Number(rawVault.configuration.fee_rate) / 100).toFixed(2) + '%',
      performanceFee: Number(rawVault.configuration.performance_fee),
      performanceFeePercent: (Number(rawVault.configuration.performance_fee) / 100).toFixed(2) + '%',
      markets: rawVault.configuration.markets,
      allocations: rawVault.configuration.allocations.map(alloc => ({
        marketAddress: alloc.market_address,
        allocationPercentage: Number(alloc.allocation_percentage),
        allocationPercent: (Number(alloc.allocation_percentage) / 100).toFixed(2) + '%',
      })),
    },
    
    // 状态信息
    state: {
      apy: Number(rawVault.state.apy),
      apyPercent: (Number(rawVault.state.apy) / 100).toFixed(2) + '%',
      currentApy: Number(rawVault.state.current_apy),
      currentApyPercent: (Number(rawVault.state.current_apy) / 100).toFixed(2) + '%',
      totalAssets: Number(rawVault.state.total_assets),
      totalAssetsFormatted: formatAssetAmount(Number(rawVault.state.total_assets)),
      totalAssetsUsd: Number(rawVault.state.total_assets_usd),
      totalAssetsUsdFormatted: formatUsdAmount(Number(rawVault.state.total_assets_usd)),
      totalSupply: Number(rawVault.state.total_supply),
      totalSupplyFormatted: formatAssetAmount(Number(rawVault.state.total_supply)),
      sharePrice: Number(rawVault.state.share_price),
      sharePriceFormatted: formatSharePrice(Number(rawVault.state.share_price)),
      performanceFeeCollected: Number(rawVault.state.performance_fee_collected),
      performanceFeeCollectedFormatted: formatAssetAmount(Number(rawVault.state.performance_fee_collected)),
    },
    
    // 分配信息
    allocations: rawVault.allocations.map(alloc => ({
      marketAddress: alloc.market_address,
      supplyAssets: Number(alloc.supply_assets),
      supplyAssetsFormatted: formatAssetAmount(Number(alloc.supply_assets)),
      supplyAssetsUsd: Number(alloc.supply_assets_usd),
      supplyAssetsUsdFormatted: formatUsdAmount(Number(alloc.supply_assets_usd)),
      expectedApy: Number(alloc.expected_apy),
      expectedApyPercent: (Number(alloc.expected_apy) / 100).toFixed(2) + '%',
    })),
  };
}

/**
 * 工具函数: 获取风险等级文本
 */
function getRiskLevelText(level) {
  const levels = ['Low Risk', 'Medium Risk', 'High Risk'];
  return levels[level] || 'Unknown';
}

/**
 * 工具函数: 格式化资产数量 (假设 6 位小数)
 */
function formatAssetAmount(amount) {
  const value = amount / 1000000;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * 工具函数: 格式化 USD 金额
 */
function formatUsdAmount(amount) {
  const value = amount / 1000000;
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 工具函数: 格式化份额价格 (6 位小数精度)
 */
function formatSharePrice(price) {
  const value = price / 1000000;
  return value.toFixed(6);
}

/**
 * 解析 returnValue 数组
 * returnValue 格式: [data: Uint8Array, type: string]
 */
export function parseReturnValue(returnValue) {
  try {
    console.log('🔍 Parsing return value:', returnValue);
    
    if (!returnValue || returnValue.length < 1) {
      throw new Error('Invalid return value');
    }
    
    // returnValue[0] 是实际的数据 (Uint8Array)
    const data = returnValue[0];
    
    // 解析 BCS 数据
    return parseVaultBCS(data);
  } catch (error) {
    console.error('❌ Error parsing return value:', error);
    throw error;
  }
}
