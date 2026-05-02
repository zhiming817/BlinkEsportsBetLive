// TypeScript 示例文件
import { Connection, PublicKey } from '@solana/web3.js';
import type { UserBalance } from '../types';

export class SolanaUtils {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // 转换为 SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async getUserBalance(address: string): Promise<UserBalance> {
    const balance = await this.getBalance(address);
    return {
      address,
      balance,
      formattedBalance: `${balance.toFixed(4)} SOL`
    };
  }

  async getBlockHeight(): Promise<number> {
    return await this.connection.getBlockHeight();
  }
}

export const formatAddress = (address: string, length: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export default SolanaUtils;
