import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchApi } from '@/utils/api';

/**
 * 球队信息接口
 */
interface Team {
  id: number;
  name: string;
  image_url: string;
  acronym: string;
}

/**
 * 比赛详情接口
 */
interface MatchDetail {
  id: number;
  team_a: Team;
  team_b: Team;
  start_at: string;
  status: string;
  number_of_games: number;
  solana_match_pda: string | null;
}

/**
 * API 响应包装
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function PredictionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const matchId = id || '1420915';
      
      // 使用统一的 fetchApi 封装函数
      const response = await fetchApi<ApiResponse<MatchDetail>>(`/api/matches/${matchId}`);
      
      if (response.success) {
        setMatchData(response.data);
      } else {
        setError(response.message || '加载详情失败');
      }
    } catch (err) {
      console.error('[PredictionDetail] Fetch error:', err);
      setError(err instanceof Error ? err.message : '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <UiIconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Prediction</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Text style={styles.optionOdds}>Odds: <Text style={styles.oddsValue}>1.85x</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionTeamName}>{matchData.team_b.name}</Text>
                <Text style={styles.optionOdds}>Odds: <Text style={styles.oddsValue}>2.10x</Text></Text>
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
                  <Text style={styles.poolValue}>--- SOL</Text>
                  <Text style={styles.poolLabel}>Total Pool</Text>
                </View>
              </View>

              <View style={styles.poolItem}>
                <View style={styles.solIconSmall}>
                   <UiIconSymbol name="wallet.pass.fill" size={12} color="white" />
                </View>
                <View>
                  <Text style={styles.poolValue}>0 SOL</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  liveBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 24,
  },
  liveText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  teamItem: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    padding: 12,
    backgroundColor: '#2C2C2E',
    marginBottom: 12,
  },
  teamLogo: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  vsText: {
    color: '#8E8E93',
    fontSize: 20,
    fontWeight: '300',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderColor: '#00F5FF',
  },
  optionTeamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionOdds: {
    color: '#8E8E93',
    fontSize: 12,
  },
  oddsValue: {
    color: '#00F5FF',
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  statsText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  poolInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  solIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  poolLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  pdaRow: {
    marginBottom: 24,
  },
  pdaTitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  pdaAddress: {
    color: '#5AC8FA',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  betButton: {
    backgroundColor: '#00F5FF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  betButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  retryText: {
    color: '#00F5FF',
    fontSize: 16,
  },
  backLink: {
    color: '#8E8E93',
    fontSize: 16,
  }
});
