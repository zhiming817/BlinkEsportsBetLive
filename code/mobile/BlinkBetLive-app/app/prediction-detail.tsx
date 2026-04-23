import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { matchApi, MatchDetail } from '@/utils/api';
import { styles } from '../styles/prediction-detail.styles';

export default function PredictionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchData, setMatchData] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // 格式化池数据
  // 根据实际返回数据，total_pool_a 和 total_pool_b 已经是 SOL 格式的字符串（例如 "0.300000000"）
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
                  <Image 
                    source={{ uri: matchData.team_a.image_url }} 
                    style={styles.teamLogo} 
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.teamName}>{matchData.team_a.acronym}</Text>
              </View>
              
              <Text style={styles.vsText}>vs</Text>

              <View style={styles.teamItem}>
                <View style={[styles.teamLogoCircle, { borderColor: '#A020F0' }]}>
                  <Image 
                    source={{ uri: matchData.team_b.image_url }} 
                    style={styles.teamLogo} 
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.teamName}>{matchData.team_b.acronym}</Text>
              </View>
            </View>

            <Text style={styles.questionText}>Who will win this match (BO{matchData.number_of_games})?</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={[styles.optionButton, styles.optionActive]}>
                <Text style={styles.optionTeamName}>{matchData.team_a.name}</Text>
                <Text style={styles.optionOdds}>Pool: <Text style={styles.oddsValue}>{poolA} SOL</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton}>
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
               <Text style={styles.pdaAddress} numberOfLines={1} ellipsizeMode="middle">
                 {matchData.solana_match_pda || 'To be initialized'}
               </Text>
            </View>

            <TouchableOpacity style={styles.betButton}>
              <Text style={styles.betButtonText}>Place Your Prediction</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
