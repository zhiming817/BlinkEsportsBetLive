import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { useRouter } from 'expo-router'

export default function PredictionDetailScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <UiIconSymbol name="xmark.circle.fill" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BlinkBet Live</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Card */}
          <View style={styles.card}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>((•)) LIVE</Text>
            </View>

            <View style={styles.teamsRow}>
              <View style={styles.teamItem}>
                <View style={[styles.teamLogoCircle, { borderColor: '#00F5FF' }]}>
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/T1_logo.svg/1200px-T1_logo.svg.png' }} 
                    style={styles.teamLogo} 
                  />
                </View>
                <Text style={styles.teamName}>T1</Text>
              </View>
              
              <Text style={styles.vsText}>vs</Text>

              <View style={styles.teamItem}>
                <View style={[styles.teamLogoCircle, { borderColor: '#A020F0' }]}>
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Gen.G_logo.svg/1200px-Gen.G_logo.svg.png' }} 
                    style={styles.teamLogo} 
                  />
                </View>
                <Text style={styles.teamName}>Gen.G</Text>
              </View>
            </View>

            <Text style={styles.questionText}>Who will get the First Blood?</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={[styles.optionButton, styles.optionActive]}>
                <Text style={styles.optionTeamName}>T1</Text>
                <Text style={styles.optionOdds}>Odds: <Text style={styles.oddsValue}>1.85x</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionTeamName}>Gen.G</Text>
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
                  <Text style={styles.poolValue}>12,500 SOL</Text>
                  <Text style={styles.poolLabel}>Total Pool</Text>
                </View>
              </View>

              <View style={styles.poolItem}>
                <View style={styles.solIconSmall}>
                   <UiIconSymbol name="wallet.pass.fill" size={12} color="white" />
                </View>
                <View>
                  <Text style={styles.poolValue}>350 SOL</Text>
                  <Text style={styles.poolLabel}>Your Stake</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionButtonSecondary}>
                <Text style={styles.actionButtonText}>Blink Cards</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButtonSecondary}
                onPress={() => router.push('/prediction-result')}
              >
                <Text style={styles.actionButtonText}>My Predictions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7D3CFF', // Purple background from UI
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#0B0C1E',
    borderRadius: 32,
    padding: 24,
    flex: 1,
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  liveText: {
    color: '#00F5FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  teamItem: {
    alignItems: 'center',
  },
  teamLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    padding: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  teamName: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
  vsText: {
    color: '#8E8E93',
    fontSize: 18,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  questionText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  optionButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionActive: {
    borderColor: '#00F5FF',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  optionTeamName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionOdds: {
    color: '#8E8E93',
    fontSize: 14,
  },
  oddsValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 6,
  },
  poolInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1B2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  poolValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  poolLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButtonSecondary: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
