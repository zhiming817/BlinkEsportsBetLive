import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { matchApi } from '../utils/api';
import IDL from '../idl/blink_bet_contract.json';

// 合约配置
const PROGRAM_ID = new PublicKey(IDL.address);

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedSide, setSelectedSide] = useState(1); // 1: Team A, 2: Team B
  const [isBetting, setIsBetting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [contractMatch, setContractMatch] = useState(null);

  // 管理员钱包地址（可以根据实际情况修改或从配置读取）
  const ADMIN_PUBKEY = "CjisaxtyK4n43PBhCATyydWQU93ruN1KJTRkcEhkGVyR"; 
  const isAdmin = publicKey && publicKey.toBase58() === ADMIN_PUBKEY;

  const presetAmounts = [0.1, 0.5, 1, 5];

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await matchApi.getMatchDetail(id);
      if (response.success) {
        setMatchData(response.data);
        await checkContractMatch(response.data.id.toString());
      } else {
        setError(response.message || 'Failed to load match details');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const checkContractMatch = async (matchIdStr) => {
    try {
      const [matchPoolPda] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("match"), anchor.utils.bytes.utf8.encode(matchIdStr)],
        PROGRAM_ID
      );
      
      const provider = new anchor.AnchorProvider(connection, {
        publicKey: publicKey || PublicKey.default,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      }, { commitment: 'confirmed' });
      const program = new anchor.Program(IDL, provider);
      
      const accountInfo = await program.account.matchPool.fetch(matchPoolPda);
      setContractMatch(accountInfo);
    } catch (e) {
      console.log('Match not initialized on-chain yet or RPC error:', e.message);
      setContractMatch(null);
    }
  };

  const handleInitializeMatch = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your admin wallet first');
      return;
    }

    if (!matchData) return;

    setIsInitializing(true);
    try {
      const matchIdStr = matchData.id.toString();
      const startTime = new anchor.BN(Math.floor(new Date(matchData.start_at.replace(' UTC', 'Z')).getTime() / 1000));
      
      const [configPda] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("config")],
        PROGRAM_ID
      );

      const [matchPoolPda] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("match"), anchor.utils.bytes.utf8.encode(matchIdStr)],
        PROGRAM_ID
      );

      // 使用 @solana/wallet-adapter-react 提供的接口，这是最稳定且不会引起 Simulation failed 的方式
      const provider = new anchor.AnchorProvider(
        connection, 
        publicKey, // 直接传入 publicKey 对象作为钱包上下文
        { commitment: 'confirmed' }
      );
      const program = new anchor.Program(IDL, provider);

      console.log('Initializing match with ID:', matchIdStr);
      
      // 获取最新的 Blockhash，防止 "already been processed" 报错
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = await program.methods
        .initializeMatch(matchIdStr, startTime)
        .accounts({
          matchPool: matchPoolPda,
          config: configPda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 使用 wallet-adapter 的 sendTransaction 发送，这是 DApp 的最佳实践
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Transaction sent, waiting for confirmation...', signature);
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      alert('Match initialized on-chain successfully!');
      await checkContractMatch(matchIdStr);
    } catch (err) {
      console.error('Initialization failed detailed:', err);
      let errorMsg = err.message;
      if (err.logs) {
        console.log('Transaction Logs:', err.logs);
      }
      alert(`Initialization failed: ${errorMsg}`);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handlePlaceBet = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!matchData) return;

    const amountNum = parseFloat(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsBetting(true);
    try {
      const matchIdStr = matchData.id.toString();
      const amountBN = new anchor.BN(Math.round(amountNum * LAMPORTS_PER_SOL));
      
      // 计算 PDA (完全匹配 test-bet.ts 逻辑)
      const [matchPoolPda] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("match"), anchor.utils.bytes.utf8.encode(matchIdStr)],
        PROGRAM_ID
      );

      const [userBetPda] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("bet"),
          anchor.utils.bytes.utf8.encode(matchIdStr),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      // 参考 test-bet.ts 的 Provider 配置
      const provider = new anchor.AnchorProvider(connection, {
        publicKey: publicKey,
        signTransaction: (tx) => window.solana.signTransaction(tx),
        signAllTransactions: (txs) => window.solana.signAllTransactions(txs),
      }, { commitment: 'confirmed' });
      const program = new anchor.Program(IDL, provider);

      console.log(`Placing bet: Match=${matchIdStr}, Amount=${amountNum} SOL, Selection=${selectedSide}`);
      
      const tx = await program.methods
        .placeBet(matchIdStr, amountBN, selectedSide)
        .accounts({
          matchPool: matchPoolPda,
          userBet: userBetPda,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Bet transaction success:', tx);
      alert(`Bet placed successfully!`);
      
      // 延迟刷新以确保链上数据已传播
      setTimeout(() => {
        fetchDetail();
      }, 2000);
    } catch (err) {
      console.error('Bet failed:', err);
      alert(`Bet failed: ${err.message}`);
    } finally {
      setIsBetting(false);
    }
  };

  // 状态显示逻辑
  const statusDisplay = useMemo(() => {
    if (!matchData) return null;
    const status = matchData.status.toLowerCase();
    
    if (['finished', 'ended', 'settled', 'completed'].includes(status)) {
      return { label: 'ENDED', color: 'text-gray-400', bg: 'bg-gray-800/50', canBet: false };
    }
    if (['running', 'live'].includes(status)) {
      return { label: 'LIVE', color: 'text-red-500', bg: 'bg-red-500/10', canBet: true };
    }
    return { label: 'UPCOMING', color: 'text-cyan-400', bg: 'bg-cyan-400/10', canBet: true };
  }, [matchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">{error || 'Match not found'}</p>
        <button 
          onClick={() => navigate('/matches')}
          className="text-orange-500 hover:underline"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  const poolA = matchData.match_pools?.total_pool_a ? parseFloat(matchData.match_pools.total_pool_a) : 0;
  const poolB = matchData.match_pools?.total_pool_b ? parseFloat(matchData.match_pools.total_pool_b) : 0;
  const totalPool = poolA + poolB;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className={`px-4 py-1 rounded-full text-xs font-bold ${statusDisplay.bg} ${statusDisplay.color}`}>
          {statusDisplay.label}
        </div>
      </div>

      {/* Match Info Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Team A */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-800 p-4">
              <img src={matchData.team_a.image_url} alt={matchData.team_a.name} className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-bold text-white">{matchData.team_a.name}</h3>
            <p className="text-gray-500 text-sm">Team A</p>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-gray-700 mb-2 italic">VS</div>
            <div className="text-gray-500 text-sm">
              {new Date(matchData.start_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-800 p-4">
              <img src={matchData.team_b.image_url} alt={matchData.team_b.name} className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-bold text-white">{matchData.team_b.name}</h3>
            <p className="text-gray-500 text-sm">Team B</p>
          </div>
        </div>

        {/* Pool Info */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-800 pt-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">Team A Pool</p>
            <p className="text-2xl font-bold text-white">{poolA.toFixed(2)} SOL</p>
          </div>
          <div className="text-center border-l border-gray-800">
            <p className="text-gray-500 text-sm mb-1">Team B Pool</p>
            <p className="text-2xl font-bold text-white">{poolB.toFixed(2)} SOL</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs">Total Pool: <span className="text-orange-500 font-medium">{totalPool.toFixed(2)} SOL</span></p>
        </div>
      </div>

      {/* Betting Section */}
      {statusDisplay.canBet && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Place Your Bet</h2>
          
          {/* Side Tabs */}
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setSelectedSide(1)}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                selectedSide === 1 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Win {matchData.team_a.name}
            </button>
            <button 
              onClick={() => setSelectedSide(2)}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                selectedSide === 2 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Win {matchData.team_b.name}
            </button>
          </div>

          {/* Amount Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <label className="text-gray-400 text-sm uppercase">Bet Amount (SOL)</label>
              <span className="text-xs text-gray-600">Est. Reward: --</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-gray-800 border-none rounded-2xl py-4 px-6 text-white text-xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">SOL</span>
            </div>
            
            <div className="flex gap-2 mt-4">
              {presetAmounts.map(amount => (
                <button 
                  key={amount}
                  onClick={() => setBetAmount(amount.toString())}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors"
                >
                  {amount} SOL
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={isBetting || !connected}
            onClick={handlePlaceBet}
            className={`w-full py-5 rounded-2xl text-xl font-black uppercase tracking-widest transition-all ${
              connected 
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isBetting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3 border-b-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                Processing...
              </span>
            ) : connected ? 'Confirm Bet' : 'Connect Wallet to Bet'}
          </button>
        </div>
      )}

      {!statusDisplay.canBet && (
        <div className="text-center py-12 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
          <p className="text-gray-500">Betting is closed for this match.</p>
        </div>
      )}

      {/* Admin Initialization Section */}
      {!contractMatch && isAdmin && (
        <div className="mt-8 bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 backdrop-blur-sm text-center">
          <h3 className="text-xl font-bold text-white mb-2">Admin: Initialize Match</h3>
          <p className="text-gray-400 mb-6 text-sm">This match exists in the database but not on the Solana blockchain yet.</p>
          <button 
            disabled={isInitializing}
            onClick={handleInitializeMatch}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isInitializing ? 'Initializing...' : 'Initialize on Solana'}
          </button>
        </div>
      )}

      {/* Match Details */}
      <div className="mt-12">
        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Streaming & Analysis</h4>
        {matchData.embed_url ? (
          <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800">
             <iframe 
               src={matchData.embed_url} 
               className="w-full h-full"
               frameBorder="0" 
               allowFullScreen
             ></iframe>
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-3xl border border-gray-800">
            <p className="text-gray-600">No live stream available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetail;