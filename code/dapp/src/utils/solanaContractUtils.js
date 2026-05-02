import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { CONTRACT_CONFIG, NETWORK_CONFIG } from '../config.js';

// 初始化 Solana 连接
export const connection = new Connection(
  NETWORK_CONFIG.RPC_URL,
  NETWORK_CONFIG.COMMITMENT
);

// 加载 IDL
let programIdl = null;
export async function loadIdl() {
  if (programIdl) return programIdl;
  
  try {
    // 在生产环境中，IDL 应该从后端或 IPFS 加载
    const response = await fetch(CONTRACT_CONFIG.IDL_PATH);
    programIdl = await response.json();
    return programIdl;
  } catch (error) {
    console.error('Failed to load IDL:', error);
    throw new Error('Cannot load program IDL');
  }
}

// 创建 Program 实例
export async function getProgram(wallet) {
  const idl = await loadIdl();
  const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
  
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: NETWORK_CONFIG.COMMITMENT }
  );
  
  return new Program(idl, programId, provider);
}

// 派生 PDA 地址
export function deriveVaultGlobalPda() {
  const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONTRACT_CONFIG.SEEDS.VAULT_GLOBAL)],
    programId
  );
  return pda;
}

export function deriveVaultPda(vaultId) {
  const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
  
  // 将 vaultId 转换为 u64 的小端字节序
  const vaultIdBuffer = Buffer.alloc(8);
  vaultIdBuffer.writeBigUInt64LE(BigInt(vaultId));
  
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONTRACT_CONFIG.SEEDS.VAULT), vaultIdBuffer],
    programId
  );
  return pda;
}

// 创建 Vault 的合约调用函数
export async function createVault(wallet, sendTransaction, vaultData, creatorAddress) {
  try {
    console.log('🚀 Creating vault with data:', vaultData);
    console.log('👤 Creator address:', creatorAddress);
    
    const program = await getProgram(wallet);
    
    // 准备参数
    const {
      basicInfo,
      strategy,
      selectedMarkets,
      configuration,
      governance
    } = vaultData;
    
    // 从 selectedMarkets 中提取市场数据
    const marketNames = selectedMarkets?.map(m => `${m.protocol}-${m.symbol}`) || [];
    const marketAddresses = selectedMarkets?.map(m => m.id || m.coinType || '') || [];
    const allocationPercentages = selectedMarkets?.map(m => new BN(Math.round((m.allocation || 0) * 100))) || [];
    
    console.log('🎯 Selected markets data:', {
      marketNames,
      marketAddresses,
      allocationPercentages: allocationPercentages.map(p => p.toString()),
      totalAllocation: allocationPercentages.reduce((sum, p) => sum.add(p), new BN(0)).toString() + ' basis points'
    });
    
    // 获取 Vault Global PDA
    const vaultGlobalPda = deriveVaultGlobalPda();
    
    // 获取当前的 vault count 来派生 vault PDA
    let vaultCount = 0;
    try {
      const vaultGlobal = await program.account.vaultGlobal.fetch(vaultGlobalPda);
      vaultCount = vaultGlobal.vaultCount.toNumber();
    } catch (error) {
      console.log('Vault Global not initialized yet, count = 0');
    }
    
    const vaultPda = deriveVaultPda(vaultCount);
    
    console.log('📍 PDAs:', {
      vaultGlobal: vaultGlobalPda.toBase58(),
      vault: vaultPda.toBase58(),
      vaultCount
    });
    
    // 构建参数（按照 Solana 合约的参数顺序）
    const targetApy = new BN(Math.round(parseFloat((strategy?.expectedApy || '8.5%').replace('%', '')) * 100));
    const strategyName = String(strategy?.name || 'Default Strategy');
    const initialDeposit = new BN(Math.round((configuration?.initialDeposit || 10000) * LAMPORTS_PER_SOL));
    const vaultName = String(basicInfo?.name || 'Default Vault');
    const vaultSymbol = String(basicInfo?.symbol || 'DVT');
    const vaultDescription = String(basicInfo?.description || 'Default description');
    const curator = String(creatorAddress || '');
    const timelockDays = new BN(Math.round(configuration?.timelock || 30));
    const guardianOpt = (governance?.id || 'no_guardian') !== 'no_guardian';
    const guardianValue = guardianOpt ? String(governance?.name || '') : '';
    const feeRate = new BN(Math.round((configuration?.managementFee || 2.5) * 100));
    const performanceFee = new BN(Math.round((configuration?.performanceFee || 15) * 100));
    const riskLevel = (strategy?.risk || 'Low Risk') === 'Low Risk' ? 0 : (strategy?.risk === 'Medium Risk' ? 1 : 2);
    const supportedTokens = ['USDC', 'SOL']; // 默认支持的代币
    const strategyType = String(strategy?.id || 'stable_yield');
    
    console.log('📝 Transaction parameters:', {
      targetApy: targetApy.toString(),
      strategyName,
      initialDeposit: initialDeposit.toString(),
      vaultName,
      vaultSymbol,
      riskLevel,
      feeRate: feeRate.toString(),
      performanceFee: performanceFee.toString()
    });
    
    // 调用合约创建 Vault
    const tx = await program.methods
      .createVault(
        targetApy,
        strategyName,
        initialDeposit,
        vaultName,
        vaultSymbol,
        vaultDescription,
        curator,
        timelockDays,
        guardianOpt,
        guardianValue,
        feeRate,
        performanceFee,
        marketNames,
        marketAddresses,
        allocationPercentages,
        // VaultStrategy 参数
        strategyName,
        String(strategy?.description || 'Default strategy description'),
        riskLevel,
        supportedTokens,
        strategyType,
        new BN(7),   // min_duration
        new BN(365), // max_duration
        true,        // auto_compound
        true         // emergency_exit
      )
      .accounts({
        creator: wallet.publicKey,
      })
      .transaction();
    
    // 发送交易
    const signature = await sendTransaction(tx, connection);
    console.log('✅ Transaction sent:', signature);
    
    // 等待确认
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
    
    console.log('✅ Vault created successfully!');
    console.log('📍 Vault PDA:', vaultPda.toBase58());
    console.log('🔗 Transaction:', `https://explorer.solana.com/tx/${signature}?cluster=${NETWORK_CONFIG.NETWORK}`);
    
    return {
      success: true,
      signature,
      vaultId: vaultCount,
      vaultAddress: vaultPda.toBase58(),
    };
    
  } catch (error) {
    console.error('❌ Error creating vault:', error);
    throw error;
  }
}

// 获取 Vault 数据
export async function getVault(wallet, vaultId) {
  try {
    const program = await getProgram(wallet);
    const vaultPda = deriveVaultPda(vaultId);
    
    const vault = await program.account.vault.fetch(vaultPda);
    
    return {
      id: vault.id.toNumber(),
      creator: vault.creator.toBase58(),
      name: vault.configuration.name,
      symbol: vault.configuration.symbol,
      description: vault.configuration.description,
      apy: vault.state.apy.toNumber() / 100, // 转换为百分比
      currentApy: vault.state.currentApy.toNumber() / 100,
      totalAssets: vault.state.totalAssets.toNumber() / LAMPORTS_PER_SOL,
      totalSupply: vault.state.totalSupply.toNumber() / LAMPORTS_PER_SOL,
      sharePrice: vault.state.sharePrice.toNumber() / 1_000_000, // 6位小数精度
      strategy: vault.strategy,
      configuration: vault.configuration,
      createdAt: new Date(vault.createdAt.toNumber() * 1000),
      address: vaultPda.toBase58(),
    };
  } catch (error) {
    console.error('Error fetching vault:', error);
    throw error;
  }
}

// 获取所有 Vaults
export async function getAllVaults(wallet) {
  try {
    const program = await getProgram(wallet);
    const vaultGlobalPda = deriveVaultGlobalPda();
    
    // 获取 vault count
    const vaultGlobal = await program.account.vaultGlobal.fetch(vaultGlobalPda);
    const vaultCount = vaultGlobal.vaultCount.toNumber();
    
    console.log(`📊 Total vaults: ${vaultCount}`);
    
    // 获取所有 vaults
    const vaults = [];
    for (let i = 0; i < vaultCount; i++) {
      try {
        const vault = await getVault(wallet, i);
        vaults.push(vault);
      } catch (error) {
        console.error(`Failed to fetch vault ${i}:`, error);
      }
    }
    
    return vaults;
  } catch (error) {
    console.error('Error fetching all vaults:', error);
    return [];
  }
}

// 更新 Vault 状态
export async function updateVaultState(wallet, sendTransaction, vaultId, newApy, newTotalAssets, newSharePrice) {
  try {
    const program = await getProgram(wallet);
    const vaultPda = deriveVaultPda(vaultId);
    
    const tx = await program.methods
      .updateVaultState(
        new BN(Math.round(newApy * 100)), // 转换为基点
        new BN(Math.round(newTotalAssets * LAMPORTS_PER_SOL)),
        new BN(Math.round(newSharePrice * 1_000_000))
      )
      .accounts({
        vault: vaultPda,
      })
      .transaction();
    
    const signature = await sendTransaction(tx, connection);
    
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
    
    console.log('✅ Vault state updated successfully!');
    return { success: true, signature };
    
  } catch (error) {
    console.error('Error updating vault state:', error);
    throw error;
  }
}

// 初始化 Vault Global（只需要调用一次）
export async function initializeVaultGlobal(wallet, sendTransaction) {
  try {
    const program = await getProgram(wallet);
    const vaultGlobalPda = deriveVaultGlobalPda();
    
    // 检查是否已经初始化
    try {
      await program.account.vaultGlobal.fetch(vaultGlobalPda);
      console.log('Vault Global already initialized');
      return { success: true, alreadyInitialized: true };
    } catch (error) {
      // 未初始化，继续
    }
    
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: wallet.publicKey,
      })
      .transaction();
    
    const signature = await sendTransaction(tx, connection);
    
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
    
    console.log('✅ Vault Global initialized successfully!');
    return { success: true, signature };
    
  } catch (error) {
    console.error('Error initializing vault global:', error);
    throw error;
  }
}

// 监听事件
export async function subscribeToVaultEvents(callback) {
  const programId = new PublicKey(CONTRACT_CONFIG.PROGRAM_ID);
  
  return connection.onLogs(
    programId,
    (logs) => {
      // 解析事件日志
      if (logs.logs.some(log => log.includes('VaultCreatedEvent'))) {
        callback({
          type: 'VaultCreated',
          logs: logs.logs,
          signature: logs.signature,
        });
      }
    },
    NETWORK_CONFIG.COMMITMENT
  );
}
