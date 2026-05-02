import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { CONTRACT_CONFIG, NETWORK_CONFIG } from '../config.js';
import { IDL } from '../idl/vault_contract_solana_idl.js';
import type { VaultContractSolana } from '../idl/vault_contract_solana.js';

// 初始化 Solana 连接
export const connection = new Connection(
  NETWORK_CONFIG.RPC_URL,
  (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment
);

// 获取 Program 实例（带类型）
export function getProgram(wallet: any): Program<VaultContractSolana> {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
  );
  
  // 使用类型断言，类似于 anchor.workspace.VaultContractSolana as Program<VaultContractSolana>
  const program = new Program<VaultContractSolana>(
    IDL as VaultContractSolana, 
    provider
  );
  
  return program;
}

// 派生 PDA
export function deriveVaultGlobalPDA(programId: PublicKey | string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONTRACT_CONFIG.SEEDS.VAULT_GLOBAL)],
    new PublicKey(programId)
  );
  return pda;
}

export function deriveVaultPDA(vaultId: number, programId: PublicKey | string): PublicKey {
  const vaultIdBuffer = Buffer.alloc(8);
  vaultIdBuffer.writeBigUInt64LE(BigInt(vaultId));
  
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONTRACT_CONFIG.SEEDS.VAULT), vaultIdBuffer],
    new PublicKey(programId)
  );
  return pda;
}

/**
 * 创建 Vault (Solana 版本)
 */
export async function createVault(wallet: any, vaultData: any, curatorAddress?: string) {
  try {
    console.log('🚀 Creating vault with data:', vaultData);
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
    
    const {
      basicInfo,
      strategy,
      selectedMarkets,
      configuration,
      governance
    } = vaultData;
    
    // 从 selectedMarkets 中提取市场数据
    const marketNames = selectedMarkets?.map((m: any) => `${m.protocol}-${m.symbol}`) || [];
    const marketAddresses = selectedMarkets?.map((m: any) => {
      // 优先使用 coinType，如果没有则使用空字符串（避免使用 number 类型的 id）
      const address = m.coinType || m.address || '';
      return String(address);
    }) || [];
    const allocationPercentages = selectedMarkets?.map((m: any) => new BN(Math.round((m.allocation || 0) * 100))) || [];
    
    console.log('🔍 Market data:', {
      marketNames,
      marketAddresses,
      allocationPercentages: allocationPercentages.map((p: BN) => p.toString())
    });
    
    // 获取 vault count 以派生 PDA
    const vaultGlobalPda = deriveVaultGlobalPDA(programId);
    
    let vaultCount = 0;
    let needsInitialization = false;
    
    try {
      const vaultGlobalAccount = await program.account.vaultGlobal.fetch(vaultGlobalPda);
      vaultCount = vaultGlobalAccount.vaultCount.toNumber();
      console.log('📊 Current vault count:', vaultCount);
    } catch (error) {
      console.log('⚠️ Vault global not initialized, will initialize first...');
      needsInitialization = true;
    }
    
    // 如果需要初始化，先初始化 vault global
    if (needsInitialization) {
      console.log('🔧 Initializing vault global...');
      try {
        const initResult = await initializeVaultGlobal(wallet);
        console.log('✅ Vault global initialized:', initResult.transactionSignature);
        // 初始化后 vault count 为 0
        vaultCount = 0;
      } catch (initError: any) {
        console.error('❌ Failed to initialize vault global:', initError);
        throw new Error(`Failed to initialize vault global: ${initError.message}`);
      }
    }
    
    const vaultPda = deriveVaultPDA(vaultCount, programId);
    
    // 构建参数
    const args = {
      targetApy: new BN(Math.round(parseFloat((strategy?.expectedApy || '8.5%').replace('%', '')) * 100)),
      strategy: String(strategy?.name || 'Default Strategy'),
      initialDeposit: new BN(Math.round((configuration?.initialDeposit || 10000) * 1000000)),
      vaultName: String(basicInfo?.name || 'Default Vault'),
      vaultSymbol: String(basicInfo?.symbol || 'DVT'),
      vaultDescription: String(basicInfo?.description || 'Default description'),
      curator: String(curatorAddress || wallet.publicKey.toString()),
      timelockDays: new BN(Math.round(configuration?.timelock || 30)),
      guardianOpt: (governance?.id || 'no_guardian') !== 'no_guardian',
      guardianValue: (governance?.id || 'no_guardian') !== 'no_guardian' ? String(governance?.name || '') : '',
      feeRate: new BN(Math.round((configuration?.managementFee || 2.5) * 100)),
      performanceFee: new BN(Math.round((configuration?.performanceFee || 15) * 100)),
      markets: marketNames,
      marketAddresses: marketAddresses,
      allocationPercentages: allocationPercentages,
      strategyName: String(strategy?.name || 'Default Strategy'),
      strategyDescription: String(strategy?.description || 'Default strategy description'),
      riskLevel: (strategy?.risk || 'Low Risk') === 'Low Risk' ? 0 : (strategy?.risk === 'Medium Risk' ? 1 : 2),
      supportedTokens: [] as string[],
      strategyType: String(strategy?.id || 'stable_yield'),
      minDuration: new BN(7),
      maxDuration: new BN(365),
      autoCompound: true,
      emergencyExit: true
    };
    
    console.log('🔍 Debug args:', {
      targetApy: args.targetApy.toString(),
      initialDeposit: args.initialDeposit.toString(),
      timelockDays: args.timelockDays.toString(),
      feeRate: args.feeRate.toString(),
      performanceFee: args.performanceFee.toString(),
      riskLevel: args.riskLevel,
      allocationPercentages: args.allocationPercentages.map((p: BN) => p.toString()),
      supportedTokens: args.supportedTokens
    });
    
    const tx = await program.methods
      .createVault(
        args.targetApy,
        args.strategy,
        args.initialDeposit,
        args.vaultName,
        args.vaultSymbol,
        args.vaultDescription,
        args.curator,
        args.timelockDays,
        args.guardianOpt,
        args.guardianValue,
        args.feeRate,
        args.performanceFee,
        args.markets,
        args.marketAddresses,
        args.allocationPercentages,
        args.strategyName,
        args.strategyDescription,
        args.riskLevel,
        args.supportedTokens,
        args.strategyType,
        args.minDuration,
        args.maxDuration,
        args.autoCompound,
        args.emergencyExit
      )
      .accounts({
        creator: wallet.publicKey,
      })
      .rpc();
    
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      vaultId: vaultCount,
      transactionSignature: tx,
      vaultAddress: vaultPda.toString()
    };
    
  } catch (error: any) {
    console.error('❌ Error creating vault:', error);
    throw new Error(`Failed to create vault: ${error.message}`);
  }
}

/**
 * 获取单个 Vault 的详细信息
 */
export async function getVault(vaultId: number, wallet: any = null) {
  try {
    let program: Program<VaultContractSolana>;
    
    if (wallet && wallet.publicKey) {
      program = getProgram(wallet);
    } else {
      const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default } as any,
        { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
      );
      program = new Program<VaultContractSolana>(
        IDL as VaultContractSolana, 
        provider
      );
    }
    
    const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
    const vaultPda = deriveVaultPDA(vaultId, programId);
    
    const vaultAccount = await program.account.vault.fetch(vaultPda);
    
    const vault = {
      id: vaultAccount.id.toNumber(),
      creator: vaultAccount.creator.toString(),
      strategy: vaultAccount.strategy,
      configuration: vaultAccount.configuration,
      state: {
        apy: vaultAccount.state.apy.toNumber(),
        currentApy: vaultAccount.state.currentApy.toNumber(),
        totalAssets: vaultAccount.state.totalAssets.toNumber(),
        totalAssetsUsd: vaultAccount.state.totalAssetsUsd.toNumber(),
        totalSupply: vaultAccount.state.totalSupply.toNumber(),
        sharePrice: vaultAccount.state.sharePrice.toNumber(),
        performanceFeeCollected: vaultAccount.state.performanceFeeCollected.toNumber()
      },
      allocations: vaultAccount.allocations,
      createdAt: vaultAccount.createdAt.toNumber(),
      address: vaultPda.toString()
    };
    
    return {
      success: true,
      vaultId,
      vault
    };
  } catch (error: any) {
    console.error('❌ Error getting vault:', error);
    return {
      success: false,
      vaultId,
      error: error.message
    };
  }
}

/**
 * 检查 Vault Global 是否已初始化
 */
export async function isVaultGlobalInitialized(wallet: any = null): Promise<boolean> {
  try {
    let program: Program<VaultContractSolana>;
    
    if (wallet && wallet.publicKey) {
      program = getProgram(wallet);
    } else {
      const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default } as any,
        { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
      );
      program = new Program<VaultContractSolana>(
        IDL as VaultContractSolana, 
        provider
      );
    }
    
    const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
    const vaultGlobalPda = deriveVaultGlobalPDA(programId);
    
    try {
      await program.account.vaultGlobal.fetch(vaultGlobalPda);
      return true;
    } catch (error: any) {
      // 账户不存在或无数据表示未初始化
      if (error.message?.includes('Account does not exist') || 
          error.message?.includes('has no data')) {
        return false;
      }
      // 其他错误也认为未初始化
      console.warn('Error checking vault global initialization:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Error in isVaultGlobalInitialized:', error);
    return false;
  }
}

/**
 * 获取 Vault 总数
 */
export async function getVaultCount(wallet: any = null): Promise<number> {
  try {
    let program: Program<VaultContractSolana>;
    
    if (wallet && wallet.publicKey) {
      program = getProgram(wallet);
    } else {
      const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default } as any,
        { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
      );
      program = new Program<VaultContractSolana>(
        IDL as VaultContractSolana, 
        provider
      );
    }
    
    const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
    const vaultGlobalPda = deriveVaultGlobalPDA(programId);
    
    try {
      const vaultGlobalAccount = await program.account.vaultGlobal.fetch(vaultGlobalPda);
      return vaultGlobalAccount.vaultCount.toNumber();
    } catch (error: any) {
      // 账户不存在表示未初始化，返回 0
      if (error.message?.includes('Account does not exist') || 
          error.message?.includes('has no data')) {
        console.log('ℹ️ Vault global not initialized yet, vault count is 0');
        return 0;
      }
      throw error; // 其他错误继续抛出
    }
  } catch (error) {
    console.error('Error getting vault count:', error);
    return 0;
  }
}

/**
 * 获取 Vault 事件（通过查询所有 Vault 账户）
 */
export async function getVaultEvents(limit: number = 10, wallet: any = null) {
  try {
    let program: Program<VaultContractSolana>;
    
    if (wallet && wallet.publicKey) {
      program = getProgram(wallet);
    } else {
      const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default } as any,
        { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
      );
      program = new Program<VaultContractSolana>(
        IDL as VaultContractSolana, 
        provider
      );
    }
    
    const vaults = await program.account.vault.all();
    
    return vaults
      .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
      .slice(0, limit)
      .map(v => ({
        id: v.account.id.toNumber(),
        name: v.account.configuration.name,
        symbol: v.account.configuration.symbol,
        creator: v.account.creator.toString(),
        targetApy: v.account.state.apy.toNumber(),
        currentApy: v.account.state.currentApy.toNumber(),
        totalAssets: v.account.state.totalAssets.toNumber(),
        strategyType: v.account.strategy.strategyType,
        riskLevel: v.account.strategy.riskLevel,
        createdAt: v.account.createdAt.toNumber(),
        address: v.publicKey.toString()
      }));
  } catch (error) {
    console.error('Error getting vault events:', error);
    return [];
  }
}

/**
 * 更新 Vault 状态
 */
export async function updateVaultState(
  wallet: any, 
  vaultId: number, 
  newApy: number, 
  newTotalAssets: number, 
  newSharePrice: number
) {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
    const vaultPda = deriveVaultPDA(vaultId, programId);
    
    const tx = await program.methods
      .updateVaultState(
        new BN(newApy),
        new BN(newTotalAssets),
        new BN(newSharePrice)
      )
      .accounts({
        vault: vaultPda,
      })
      .rpc();
    
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      transactionSignature: tx
    };
  } catch (error: any) {
    console.error('Error updating vault state:', error);
    throw new Error(`Failed to update vault state: ${error.message}`);
  }
}

/**
 * 初始化 Vault 全局状态（只需要调用一次）
 */
export async function initializeVaultGlobal(wallet: any) {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();
    
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      transactionSignature: tx
    };
  } catch (error: any) {
    console.error('Error initializing vault global:', error);
    throw new Error(`Failed to initialize: ${error.message}`);
  }
}
