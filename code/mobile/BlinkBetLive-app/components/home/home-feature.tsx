import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { useRouter } from 'expo-router'
import { fetchApi } from '@/utils/api'

const { width } = Dimensions.get('window')

interface Team {
  id: number;
  name: string;
  acronym: string;
  image_url: string;
}

interface Match {
  id: number;
  team_a: Team;
  team_b: Team;
  start_at: string;
  status: string;
  number_of_games: number;
}

export function HomeFeature() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApi<{ success: boolean; data: Match[] }>('/api/matches/featured')
      .then(json => {
        console.log('Fetched data:', json);
        if (json.success) {
          setMatches(json.data)
        }
      })
      .catch(err => {
        console.error('Fetch error details:', err.message);
      })
      .finally(() => setLoading(false))
  }, [])

  const featuredMatch = matches.length > 0 ? matches[0] : null

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>BlinkBet Live</Text>
          <View style={styles.balanceContainer}>
            <View style={styles.solIconCircle}>
              <UiIconSymbol name="wallet.pass.fill" size={16} color="white" />
            </View>
            <View>
              <Text style={styles.balanceLabel}>BALANCE:</Text>
              <Text style={styles.balanceValue}>145.2 SOL</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#00F5FF" style={{ marginTop: 40 }} />
          ) : featuredMatch ? (
            /* Featured Upcoming Match Card */
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => router.push('/prediction-detail')}
            >
              <View style={[styles.upcomingIndicator, featuredMatch.status === 'running' && styles.liveIndicator]}>
                <Text style={[styles.upcomingText, featuredMatch.status === 'running' && styles.liveText]}>
                  {featuredMatch.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.teamsContainer}>
                <View style={styles.teamInfo}>
                  <Image source={{ uri: featuredMatch.team_a.image_url }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{featuredMatch.team_a.name}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.teamInfo}>
                  <Image source={{ uri: featuredMatch.team_b.image_url }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{featuredMatch.team_b.name}</Text>
                </View>
              </View>
              <View style={styles.bottomBar}>
                <UiIconSymbol name="clock.fill" size={14} color="#8E8E93" />
                <Text style={styles.gameTime}>
                  {featuredMatch.start_at.split(' ')[1].substring(0, 5)} (UTC)
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Market Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FEATURED MARKETS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/market')}>
              <Text style={styles.showAllText}>More Markets {'>'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchScroll}>
            {matches.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.matchCard}
                onPress={() => router.push('/prediction-detail')}
              >
                <View style={styles.matchIconContainer}>
                  <UiIconSymbol name="trophy.fill" size={32} color="#00F5FF" />
                </View>
                <Text style={styles.matchTitle}>{item.team_a.acronym} vs {item.team_b.acronym}</Text>
                <Text style={styles.matchSubtitle}>BO{item.number_of_games}</Text>
                <View style={styles.oddsRow}>
                  <View style={styles.oddItem}>
                    <Text style={styles.oddLabel}>{item.team_a.name}</Text>
                    <Text style={styles.oddValue}>1.85</Text>
                  </View>
                  <View style={styles.oddItem}>
                    <Text style={styles.oddLabel}>{item.team_b.name}</Text>
                    <Text style={styles.oddValue}>2.10</Text>
                  </View>
                </View>
                <View style={styles.betButton}>
                  <Text style={styles.betButtonText}>PLACE PREDICTION</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C1E',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoText: {
    color: '#00F5FF',
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    paddingRight: 16,
    paddingLeft: 4,
    paddingVertical: 4,
  },
  solIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1B2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  featuredCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 20,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  upcomingIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  upcomingText: {
    color: '#00F5FF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  teamInfo: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  teamName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vsText: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  gameTime: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  liveIndicator: {
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
    borderColor: '#FF2D55',
  },
  liveText: {
    color: '#FF2D55',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  showAllText: {
    color: '#00F5FF',
    fontSize: 14,
  },
  matchScroll: {
    flexDirection: 'row',
  },
  matchCard: {
    width: width * 0.6,
    backgroundColor: 'rgba(26, 27, 46, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  matchTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 16,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  oddItem: {
    flex: 1,
  },
  oddLabel: {
    color: '#8E8E93',
    fontSize: 10,
    marginBottom: 2,
  },
  oddValue: {
    color: '#00F5FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  betButton: {
    backgroundColor: '#00F5FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  betButtonText: {
    color: '#0B0C1E',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

