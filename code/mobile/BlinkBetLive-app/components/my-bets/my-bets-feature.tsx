import React, { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, StyleSheet, View, Text, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { PredictionCard } from './prediction-card'
import { matchApi, UserBetItem } from '@/utils/api'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'

export function MyBetsFeature() {
  const { authorize, account: selectedAccount } = useMobileWallet()
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active')
  const [bets, setBets] = useState<UserBetItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBets = async () => {
    if (!selectedAccount) return;
    
    try {
      console.log('address:', selectedAccount.publicKey.toString(), 'fetching bets with status:', activeTab );
      const response = await matchApi.getUserBets(selectedAccount.publicKey.toString(), activeTab);
      if (response.success) {
        setBets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user bets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      setLoading(true);
      fetchBets();
    } else {
      setBets([]);
    }
  }, [activeTab, selectedAccount]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBets();
  };

  // 将后端数据结构适配给已有的 PredictionCard 组件
  const adaptedData = bets.map(bet => ({
    id: bet.id,
    status: bet.status === 'Pending' ? 'ACTIVE' : 'SETTLED',
    result: bet.status === 'Win' ? 'WON' : (bet.status === 'Lose' ? 'LOST' : ''),
    match: bet.match_name,
    league: bet.league,
    prediction: bet.side_name,
    wager: `${bet.amount} SOL`,
    payout: '--', // 暂时不计算
    potential: '--',
    matchTime: bet.start_at
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.title}>My Predictions</Text>
          <UiIconSymbol name="person.circle" size={24} color="#8E8E93" />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
            onPress={() => setActiveTab('Active')}
          >
            <Text
              style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'History' && styles.activeTab]}
            onPress={() => setActiveTab('History')}
          >
            <Text
              style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#00F5FF" style={{ marginTop: 40 }} />
          ) : !selectedAccount ? (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Text style={{ color: 'white', fontSize: 16, marginBottom: 20 }}>Please connect your wallet first</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#00F5FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
                onPress={() => authorize().catch(() => {})}
              >
                <Text style={{ color: '#0B0C1E', fontWeight: 'bold' }}>Connect Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            adaptedData.map((item) => (
              <PredictionCard key={item.id} item={item} />
            ))
          )}
          {!loading && selectedAccount && adaptedData.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Text style={{ color: '#8E8E93' }}>No predictions found</Text>
            </View>
          )}
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1B2E',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 21,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2D2E45',
  },
  tabText: {
    fontWeight: '700',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#00F5FF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
})
