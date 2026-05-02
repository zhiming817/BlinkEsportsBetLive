// TypeScript 类型定义示例
// 可以在 JS 文件中通过 JSDoc 注释使用这些类型

import { PublicKey } from '@solana/web3.js';

/**
 * Vault 配置接口
 */
export interface VaultConfig {
  name: string;
  description: string;
  targetAmount: number;
  duration: number;
  strategyType: 'lending' | 'staking' | 'liquidity';
}

/**
 * Vault 状态接口
 */
export interface VaultState {
  id: number;
  creator: PublicKey;
  name: string;
  description: string;
  totalAmount: number;
  targetAmount: number;
  status: 'active' | 'paused' | 'closed';
  createdAt: number;
}

/**
 * 策略配置接口
 */
export interface StrategyConfig {
  type: 'lending' | 'staking' | 'liquidity';
  protocol: string;
  parameters: Record<string, any>;
}

/**
 * Vault 事件接口
 */
export interface VaultEvent {
  vault_id: number;
  event_type: string;
  timestamp: number;
  data: any;
}

/**
 * 交易结果接口
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * 用户余额接口
 */
export interface UserBalance {
  address: string;
  balance: number;
  formattedBalance: string;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 导出所有类型
export type VaultStatus = 'active' | 'paused' | 'closed';
export type StrategyType = 'lending' | 'staking' | 'liquidity';
