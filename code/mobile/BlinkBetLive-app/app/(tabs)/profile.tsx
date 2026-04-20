import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

export default function ProfileScreen() {
  const router = useRouter()
  const [notifications, setNotifications] = React.useState(true)

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <UiIconSymbol name="xmark.circle.fill" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <UiIconSymbol name="gearshape.fill" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section with Avatar Decoration */}
          <View style={styles.heroSection}>
            <View style={styles.avatarDecoration}>
                <View style={styles.avatarMainCircle}>
                    <Image 
                        source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cybersage' }} 
                        style={styles.avatarImage} 
                    />
                </View>
            </View>
            <Text style={styles.userName}>CyberSage</Text>
            <Text style={styles.userRole}>Pro Predictor</Text>
            <Text style={styles.userAddress}>0x...Blink</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Win Rate:</Text>
                <View style={styles.statValueRow}>
                    <View style={styles.progressRingPlaceholder}>
                        <View style={[styles.progressRingInner, { borderColor: '#A020F0' }]} />
                    </View>
                    <Text style={styles.statPercentText}>72%</Text>
                </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Profit:</Text>
                <View style={styles.statValueRow}>
                    <View style={styles.solIconSmall}>
                         <UiIconSymbol name="wallet.pass.fill" size={12} color="white" />
                    </View>
                    <Text style={styles.profitText}>+420 SOL ↑</Text>
                </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <UiIconSymbol name="xmark.circle.fill" size={20} color="#8E8E93" />
                <Text style={styles.menuText}>Notifications</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.statusText, { color: notifications ? '#00F5FF' : '#8E8E93' }]}>{notifications ? 'On' : 'Off'}</Text>
                <Switch 
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#2D2E45', true: '#00F5FF' }}
                    thumbColor={'white'}
                />
              </View>
            </View>
          </View>

          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuHeader}>
              <View style={styles.menuLeft}>
                <UiIconSymbol name="xmark.circle.fill" size={20} color="#8E8E93" />
                <Text style={styles.menuText}>Security & Privacy</Text>
              </View>
              <UiIconSymbol name="xmark.circle.fill" size={16} color="#8E8E93" />
            </TouchableOpacity>
            
            <View style={styles.subMenuContainer}>
                <TouchableOpacity style={styles.subMenuItem}>
                    <Text style={styles.subMenuText}>Two-Factor Authentication</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subMenuItem}>
                    <Text style={styles.subMenuText}>Linked Wallets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subMenuItem}>
                    <Text style={styles.subMenuText}>Transaction History</Text>
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
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarDecoration: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    marginBottom: 16,
  },
  avatarMainCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: '#A64DFF',
      overflow: 'hidden',
      padding: 4,
      backgroundColor: '#0B0C1E',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#00F5FF',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4,
  },
  userAddress: {
    color: '#8E8E93',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1B2E',
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRingPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: 'rgba(166, 77, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  progressRingInner: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      borderWidth: 3,
      borderLeftColor: 'transparent',
      borderBottomColor: 'transparent',
  },
  statPercentText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  solIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profitText: {
    color: '#00F5FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subMenuContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subMenuItem: {
    paddingVertical: 12,
  },
  subMenuText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 32,
  },
})
