import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { matchApi, MatchDetail } from '@/utils/api';
import { styles } from '../styles/prediction-detail.styles';

// Solana & Anchor
import * as anchor from "@coral-xyz/anchor";
import { useMobileWallet, useAuthorization } from '@wallet-ui/react-native-web3js';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from 'buffer';

// 这里的 Program ID 需要和你的合约一致
const PROGRAM_ID = new PublicKey("AcAyrnzU2cTMTGR6TV9ry8VHCbiPU68R3mG964agr8uv");

// IDL 接口定义（简化版，仅包含 placeBet 方法）
const IDL: any = {
  "version": "0.1.0",
  "name": "blink_bet_contract",
  "instructions": [
    {
      "name": "placeBet",
      "accounts": [
        { "name": "matchPool", "isMut": true, "isSigner": false },
        { "name": "userBet", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "matchId", "type": "string" },
        { "name": "amount", "type": "u64" },
        { "name": "side", "type": "u8" }
      ]
    }
  ]
};

export default function PredictionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { connection, authorize, account, signAndSendTransaction } = useMobileWallet();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchData, setMatchData] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 投注选择：1 为 Team A, 2 为 Team B
  const [selectedSide, setSelectedSide] = useState<1 | 2>(1);
  const [betting, setBetting] = useState(false);

  const fetchDetail = async (isMounted: boolean, isRefresh = false) => {
    try {
      if (isMounted && !isRefresh) setLoading(true);
      setError(null);
      const matchId = Array.isArray(id) ? id[0] : (id || '1420915');
      const response = await matchApi.getMatchDetail(matchId);
      if (isMounted) {
        if (response.success) {
          setMatchData(response.data);
        } else {
          setError(response.message || '加载详情失败');
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error('[PredictionDetail] Fetch error:', err);
        setError(err instanceof Error ? err.message : '网络请求失败');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDetail(isMounted);
    return () => { isMounted = false; };
  }, [id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDetail(true, true);
  }, [id]);

  // 处理下注逻辑
  const handlePlaceBet = async () => {
    if (!matchData) return;
    
    // 1. 检查钱包连接
    if (!selectedAccount) {
      try {
        await authorize();
      } catch (e) {
        Alert.alert("Error", "Please connect your wallet first");
        return;
      }
      return;
    }

    setBetting(true);
    try {
      // 2. 初始化 Anchor Provider 
      const matchId = matchData.id.toString();
      const amount = new anchor.BN(100_000_000); // 固定 0.1 SOL
      const side = selectedSide;

      // 计算 PDA
      const [matchPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        PROGRAM_ID
      );

      const [userBetPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("bet"),
          Buffer.from(matchId),
          new PublicKey(selectedAccount.publicKey).toBuffer()
        ],
        PROGRAM_ID
      );

      // 构造 Mock Wallet 对接 Anchor 进行交易构造
      const mockWallet = {
        publicKey: new PublicKey(selectedAccount.publicKey),
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };

      const provider = new anchor.AnchorProvider(connection, mockWallet as any, { commitment: "confirmed" });
      const program = new anchor.Program(IDL, PROGRAM_ID, provider);

      // 3. 构建指令并生成交易
      const instruction = await program.methods
        .placeBet(matchId, amount, side)
        .accounts({
          matchPool: matchPda,
          userBet: userBetPda,
          user: selectedAccount.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .instruction();

      const transaction = new anchor.web3.Transaction().add(instruction);
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = new PublicKey(selectedAccount.publicKey);

      // 4. 调用 signAndSendTransaction 发起钱包签署
      const signature = await signAndSendTransaction(transaction);

      Alert.alert("Success", `Bet placed successfully!\nTX: ${signature.substring(0, 20)}...`);
      fetchDetail(true, true); // 刷新数据
    } catch (err: any) {
      console.error("Place bet failed:", err);
      Alert.alert("Transaction Failed", err.message || "Unknown error");
    } finally {
      setBetting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00F5FF" />
      </View>
    );
  }

  if (error || !matchData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || '未找到比赛信息'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDetail(true)}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const poolA = matchData.match_pools?.total_pool_a ? parseFloat(matchData.match_pools.total_pool_a).toFixed(2) : '0.00';
  const poolB = matchData.match_pools?.total_pool_b ? parseFloat(matchData.match_pools.total_pool_b).toFixed(2) : '0.00';
  const totalPoolVal = (parseFloat(poolA) + parseFloat(poolB)).toFixed(2);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <UiIconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Prediction</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00F5FF"
              colors={['#00F5FF']}
            />
          }
        >
          {/* Main Card */}
          <View style={styles.card}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>
                {matchData.status === 'upcoming' ? 'UPCOMING' : '((•)) LIVE'}
              </Text>
            </View>

            <View style={styles.teamsRow}>
              <View style={styles.teamItem}>
                <View style={[styles.teamLogoCircle, { borderColor: '#00F5FF' }]}>
                  <Image source={{ uri: matchData.team_a.image_url }} style={styles.teamLogo} resizeMode="contain" />
                </View>
                <Text style={styles.teamName}>{matchData.team_a.acronym}</Text>
              </View>
              <Text style={styles.vsText}>vs</Text>
              <View style={styles.teamItem}>
                <View style={[styles.teamLogoCircle, { borderColor: '#A020F0' }]}>
                  <Image source={{ uri: matchData.team_b.image_url }} style={styles.teamLogo} resizeMode="contain" />
                </View>
                <Text style={styles.teamName}>{matchData.team_b.acronym}</Text>
              </View>
            </View>

            <Text style={styles.questionText}>Who will win (BO{matchData.number_of_games})?</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.optionButton, selectedSide === 1 && styles.optionActive]}
                onPress={() => setSelectedSide(1)}
              >
                <Text style={styles.optionTeamName}>{matchData.team_a.name}</Text>
                <Text style={styles.optionOdds}>Pool: <Text style={styles.oddsValue}>{poolA} SOL</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, selectedSide === 2 && styles.optionActive]}
                onPress={() => setSelectedSide(2)}
              >
                <Text style={styles.optionTeamName}>{matchData.team_b.name}</Text>
                <Text style={styles.optionOdds}>Pool: <Text style={styles.oddsValue}>{poolB} SOL</Text></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <UiIconSymbol name="chart.bar.fill" size={16} color="#8E8E93" />
              <Text style={styles.statsText}>Real-time Pool Stats</Text>
            </View>

            <View style={styles.poolInfoRow}>
              <View style={styles.poolItem}>
                <View style={styles.solIconSmall}>
                  <UiIconSymbol name="wallet.pass.fill" size={12} color="white" />
                </View>
                <View>
                  <Text style={styles.poolValue}>{totalPoolVal} SOL</Text>
                  <Text style={styles.poolLabel}>Total Pool</Text>
                </View>
              </View>
              <View style={styles.poolItem}>
                <View style={styles.solIconSmall}>
                  <UiIconSymbol name="wallet.pass.fill" size={12} color="white" />
                </View>
                <View>
                  <Text style={styles.poolValue}>0.00 SOL</Text>
                  <Text style={styles.poolLabel}>Your Stake</Text>
                </View>
              </View>
            </View>

            <View style={styles.pdaRow}>
              <Text style={styles.pdaTitle}>Solana PDA:</Text>
              <Text style={styles.pdaAddress} numberOfLines={1} ellipsizeMode="middle">{matchData.solana_match_pda || 'N/A'}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.betButton, betting && { opacity: 0.7 }]} 
              onPress={handlePlaceBet}
              disabled={betting}
            >
              {betting ? (
                <ActivityIndicator color="#0B0C1E" />
              ) : (
                <Text style={styles.betButtonText}>
                  {account ? `BET 0.1 SOL ON ${selectedSide === 1 ? matchData.team_a.acronym : matchData.team_b.acronym}` : 'CONNECT WALLET'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
