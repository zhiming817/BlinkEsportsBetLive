import { STRATEGY_OPTIONS } from '../config.js';

/**
 * 根据策略 ID 获取策略名称
 * @param {string} strategyId - 策略ID (如 'stable_yield', 'balanced_growth' 等)
 * @returns {string} 策略名称 (如 'Stable Yield', 'Balanced Growth' 等)
 */
export function getStrategyNameById(strategyId) {
  if (!strategyId) {
    return 'N/A';
  }
  
  const strategy = STRATEGY_OPTIONS.find(s => s.id === strategyId);
  return strategy ? strategy.name : strategyId; // 如果找不到就返回原始ID
}

/**
 * 根据策略 ID 获取完整的策略信息
 * @param {string} strategyId - 策略ID
 * @returns {object|null} 策略对象或null
 */
export function getStrategyById(strategyId) {
  if (!strategyId) {
    return null;
  }
  
  return STRATEGY_OPTIONS.find(s => s.id === strategyId) || null;
}
