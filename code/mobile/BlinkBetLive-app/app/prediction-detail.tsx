import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchApi } from '@/utils/api';
import { styles } from '../styles/prediction-detail.styles';

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

  const fetchDetail = async (isMounted: boolean) => {
    try {
      if (isMounted) setLoading(true);
      setError(null);
      
      const matchId = Array.isArray(id) ? id[0] : (id || '1420915');
      
      const response = await fetchApi<ApiResponse<MatchDetail>>(`/api/matches/${matchId}`);
      
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
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDetail(isMounted);
    return () => { isMounted = false; };
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDetail(true)}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>返回进度页面</Text>
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
