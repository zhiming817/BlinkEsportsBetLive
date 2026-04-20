import React from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import homeData from '@/assets/data/home.json'

import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

export function HomeFeature() {
  const router = useRouter()

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
          {/* Live Game Card */}
          <TouchableOpacity 
            style={styles.liveCard}
            onPress={() => router.push('/prediction-detail')}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.teamsContainer}>
              <View style={styles.teamInfo}>
                <Image source={{ uri: homeData.live.team1.logo }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{homeData.live.team1.name}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.teamInfo}>
                <Image source={{ uri: homeData.live.team2.logo }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{homeData.live.team2.name}</Text>
              </View>
            </View>
            <View style={styles.bottomBar}>
              <View style={[styles.miniTeamLogo, { backgroundColor: '#EB0029' }]} />
              <Text style={styles.gameTime}>{homeData.live.time}</Text>
              <View style={[styles.miniTeamLogo, { backgroundColor: '#D9B44A' }]} />
            </View>
          </TouchableOpacity>

          {/* Live Odds Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LIVE ODDS</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00F5FF' }]} />
                <Text style={styles.legendText}>T1</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#A020F0' }]} />
                <Text style={styles.legendText}>Gen.G</Text>
              </View>
            </View>
          </View>

          {/* Dummy Graph Placeholder */}
          <View style={styles.graphContainer}>
            <View style={styles.graphPlaceholder}>
              {/* This would be a real chart in a production app */}
              <View style={styles.graphLineContainer}>
                {/* Simulated Wave Lines */}
                <View style={[styles.graphLine, { borderColor: '#A020F0', top: 40 }]} />
                <View style={[styles.graphLine, { borderColor: '#00F5FF', top: 20 }]} />
              </View>
              <View style={[styles.graphMarker, { left: '70%', top: 20 }]}>
                <View style={styles.markerLine} />
                <View style={[styles.markerLabel, { bottom: 30 }]}>
                  <Text style={styles.markerText}>T1</Text>
                </View>
                <View style={[styles.markerLabel, { top: 30 }]}>
                  <Text style={styles.markerText}>Gen.G</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Micro Predictions Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MICRO-PREDICTIONS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/my-bets')}>
              <Text style={styles.showAllText}>Show All {'>'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.microScroll}>
            {homeData.microPredictions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.microCard}
                onPress={() => router.push('/prediction-detail')}
              >
                <View style={styles.microIconContainer}>
                  <UiIconSymbol name={item.icon as any} size={32} color="#00F5FF" />
                </View>
                <Text style={styles.microTitle}>{item.title}</Text>
                <View style={styles.microOddsRow}>
                  <Text style={styles.microOddLabel}>T1: <Text style={styles.microOddValue}>{item.odds.team1}</Text></Text>
                  <Text style={styles.microOddLabel}>Gen.G: <Text style={styles.microOddValue}>{item.odds.team2}</Text></Text>
                </View>
                <View style={styles.microButtonsRow}>
                  <View style={styles.microButton}>
                    <Text style={styles.microButtonText}>BET T1</Text>
                  </View>
                  <View style={styles.microButton}>
                    <Text style={styles.microButtonText}>BET Gen.G</Text>
                  </View>
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
  liveCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 20,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EB0029',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  miniTeamLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
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
  legendContainer: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  graphContainer: {
    height: 150,
    width: '100%',
    backgroundColor: 'rgba(26, 27, 46, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  graphPlaceholder: {
    flex: 1,
    padding: 16,
  },
  graphLineContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  graphLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 2,
    borderStyle: 'solid',
    opacity: 0.8,
  },
  graphMarker: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'white',
    opacity: 0.3,
    alignItems: 'center',
  },
  markerLine: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    position: 'absolute',
    top: '50%',
    marginTop: -4,
  },
  markerLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  markerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  showAllText: {
    color: '#00F5FF',
    fontSize: 14,
  },
  microScroll: {
    flexDirection: 'row',
  },
  microCard: {
    width: width * 0.4,
    backgroundColor: 'rgba(26, 27, 46, 0.8)',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  microIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  microTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  microOddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  microOddLabel: {
    color: '#8E8E93',
    fontSize: 10,
  },
  microOddValue: {
    color: '#00F5FF',
    fontWeight: 'bold',
  },
  microButtonsRow: {
    width: '100%',
  },
  microButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  microButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

