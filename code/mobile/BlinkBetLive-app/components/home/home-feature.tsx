import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { useRouter } from 'expo-router'
import { fetchApi } from '@/utils/api'
import { WebView } from 'react-native-webview'
import { styles } from '@/styles/home-feature.styles'

interface Team {
  id: number
  name: string
  acronym: string
  image_url: string
}

interface Match {
  id: number
  team_a: Team
  team_b: Team
  start_at: string
  status: string
  number_of_games: number
  is_featured: boolean
  embed_url: string | null
}

export function HomeFeature() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMatches = async () => {
    try {
      const json = await fetchApi<{ success: boolean; data: Match[] }>('/api/matches/featured')
      console.log('Fetched data:', json)
      if (json.success) {
        setMatches(json.data)
      }
    } catch (err) {
      console.error('Fetch error details:', err instanceof Error ? err.message : err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchMatches()
  }

  const featuredMatch = matches.length > 0 ? matches[0] : null

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.logoText}>BlinkBet Live</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
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
          {loading ? (
            <ActivityIndicator size="large" color="#00F5FF" style={{ marginTop: 40 }} />
          ) : (
            <>
              {featuredMatch?.embed_url && (
                <View style={styles.liveStreamContainer}>
                  <View style={styles.liveStreamHeader}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveStreamTitle}>
                      LIVE: {featuredMatch.team_a.acronym} VS {featuredMatch.team_b.acronym}
                    </Text>
                  </View>
                  <View style={styles.webViewWrapper}>
                    <WebView
                      style={styles.webView}
                      source={{ uri: featuredMatch.embed_url }}
                      allowsFullscreenVideo={true}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      startInLoadingState={true}
                      renderLoading={() => (
                        <ActivityIndicator
                          color="#00F5FF"
                          size="large"
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                    />
                  </View>
                </View>
              )}

              {featuredMatch && (
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() =>
                    router.push({
                      pathname: '/prediction-detail',
                      params: { id: featuredMatch.id },
                    })
                  }
                >
                  <View
                    style={[
                      styles.upcomingIndicator,
                      featuredMatch.status === 'running' && styles.liveIndicator,
                    ]}
                  >
                    <Text
                      style={[
                        styles.upcomingText,
                        featuredMatch.status === 'running' && styles.liveText,
                      ]}
                    >
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
              )}
            </>
          )}

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
                onPress={() =>
                  router.push({
                    pathname: '/prediction-detail',
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.matchIconContainer}>
                  <UiIconSymbol name="trophy.fill" size={32} color="#00F5FF" />
                </View>
                <Text style={styles.matchTitle}>
                  {item.team_a.acronym} vs {item.team_b.acronym}
                </Text>
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