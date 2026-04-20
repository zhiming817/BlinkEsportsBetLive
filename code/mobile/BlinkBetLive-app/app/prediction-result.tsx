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

export default function PredictionResultScreen() {
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
            <View style={styles.balanceContainer}>
                <UiIconSymbol name="wallet.pass.fill" size={14} color="white" />
                <Text style={styles.balanceText}>4.5 SOL</Text>
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Card */}
          <View style={styles.card}>
            <View style={styles.settledHeader}>
              <Text style={styles.settledTitle}>SETTLED</Text>
              <UiIconSymbol name="checkmark.circle.fill" size={20} color="#00F5FF" />
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>League of Legends:</Text>
              <Text style={styles.gameTitle}>Worlds 2024 Finals</Text>
            </View>

            <View style={styles.teamsRow}>
                <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/T1_logo.svg/1200px-T1_logo.svg.png' }} 
                    style={styles.miniTeamLogo} 
                />
                <Text style={styles.teamNameText}>T1 <Text style={styles.vsInfoText}>vs.</Text> Weibo Gaming</Text>
                <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Gen.G_logo.svg/1200px-Gen.G_logo.svg.png' }} 
                    style={styles.miniTeamLogo} 
                />
            </View>

            {/* Winning Section */}
            <View style={styles.rewardContainer}>
                <Text style={styles.rewardValue}>+0.5 SOL</Text>
                <View style={styles.winnerOption}>
                    <Text style={styles.winnerText}>T1</Text>
                    <Text style={styles.winnerSubText}>(WINNER)</Text>
                    <View style={styles.winnerBadge}>
                        <Text style={styles.winnerBadgeText}>+0.5 SOL WON</Text>
                    </View>
                </View>
            </View>

            {/* Loser Section (Simulated) */}
            <View style={styles.loserOption}>
                <Text style={styles.loserText}>Weibo Gaming</Text>
                <Text style={styles.loserSubText}>(LOSER)</Text>
                <View style={styles.loserBadge}>
                    <Text style={styles.loserBadgeText}>-0.5 SOL LOST</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bet Type:</Text>
                <Text style={styles.detailValue}>Match Winner</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Odds:</Text>
                <Text style={styles.detailValue}>2.0x</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Your Stake:</Text>
                <Text style={styles.detailValue}>0.5 SOL</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                    <View style={styles.progressIcon}>
                         <UiIconSymbol name="ladybug.fill" size={12} color="white" />
                    </View>
                </View>
                <Text style={styles.settledInstantText}>SETTLED INSTANTLY</Text>
            </View>

            <View style={styles.successToast}>
                <View style={styles.successIconCircle}>
                    <UiIconSymbol name="checkmark.circle.fill" size={16} color="white" />
                </View>
                <View style={styles.successTextContainer}>
                    <Text style={styles.successTitle}>Transaction Successful:</Text>
                    <Text style={styles.successDesc}>0.5 SOL credited to your wallet</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.explorerLink}>View on Explorer</Text>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#00F5FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  balanceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#0B0C1E',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00F5FF',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  settledHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  settledTitle: {
    color: '#00F5FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 2,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  miniTeamLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  teamNameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vsInfoText: {
    color: '#8E8E93',
    fontWeight: 'normal',
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardValue: {
    color: '#00F5FF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  winnerOption: {
    width: '100%',
    backgroundColor: '#00F5FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerText: {
    color: '#0B0C1E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winnerSubText: {
    color: '#0B0C1E',
    fontSize: 14,
    marginBottom: 12,
  },
  winnerBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  winnerBadgeText: {
    color: '#0B0C1E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loserOption: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  loserText: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loserSubText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 12,
  },
  loserBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loserBadgeText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    backgroundColor: '#00F5FF',
    height: '100%',
    width: '95%',
    borderRadius: 6,
  },
  progressIcon: {
    position: 'absolute',
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  settledInstantText: {
    color: '#00F5FF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  successToast: {
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  successIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  successDesc: {
    color: '#00F5FF',
    fontSize: 10,
  },
  explorerLink: {
    color: '#8E8E93',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
})
