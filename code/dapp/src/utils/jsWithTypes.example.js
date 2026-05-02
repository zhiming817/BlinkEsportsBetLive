/**
 * JavaScript 文件中使用 TypeScript 类型的示例
 * 
 * 通过 JSDoc 注释，JavaScript 文件也可以获得类型检查和智能提示
 */

/**
 * @typedef {import('../types').VaultConfig} VaultConfig
 * @typedef {import('../types').TransactionResult} TransactionResult
 */

/**
 * 验证 Vault 配置
 * @param {VaultConfig} config - Vault 配置对象
 * @returns {boolean} 配置是否有效
 */
export function validateVaultConfig(config) {
  if (!config.name || config.name.length < 3) {
    return false;
  }
  if (!config.description || config.description.length < 10) {
    return false;
  }
  if (config.targetAmount <= 0) {
    return false;
  }
  if (config.duration <= 0) {
    return false;
  }
  return true;
}

/**
 * 格式化金额
 * @param {number} amount - 金额（lamports）
 * @param {number} [decimals=9] - 小数位数
 * @returns {string} 格式化后的金额字符串
 */
export function formatAmount(amount, decimals = 9) {
  const value = amount / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

/**
 * 创建交易结果对象
 * @param {string} signature - 交易签名
 * @param {boolean} success - 是否成功
 * @param {string} [error] - 错误信息
 * @returns {TransactionResult} 交易结果
 */
export function createTransactionResult(signature, success, error) {
  return {
    signature,
    success,
    ...(error && { error })
  };
}

/**
 * 在 JavaScript 中使用 TypeScript 类的示例
 * @param {import('./solanaUtils').default} solanaUtils - Solana 工具实例
 * @param {string} address - 钱包地址
 * @returns {Promise<string>} 格式化的余额
 */
export async function getFormattedBalance(solanaUtils, address) {
  const balance = await solanaUtils.getBalance(address);
  return formatAmount(balance * 1e9);
}

// 使用示例：
// import { validateVaultConfig } from './jsWithTypes.example.js';
// 
// const config = {
//   name: 'My Vault',
//   description: 'A test vault',
//   targetAmount: 1000,
//   duration: 30,
//   strategyType: 'lending' // VSCode 会提示可用的选项
// };
// 
// if (validateVaultConfig(config)) {
//   console.log('Config is valid!');
// }
