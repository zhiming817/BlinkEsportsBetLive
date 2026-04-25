import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import { matchApi, MarketMatchItem } from '@/utils/api';
import { useRouter } from 'expo-router';

export function MarketFeature() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [markets, setMarkets] = useState<MarketMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['All',"Lol", 'CS2', 'Dota 2']; // 暂时从本地定义

  const fetchMarkets = async () => {
    try {
      const response = await matchApi.getMarketMatches();
      if (response.success) {
        setMarkets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch markets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarkets();
  };

  const filteredMarkets = selectedCategory === 'All' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Market</Text>
          <TouchableOpacity>
            <UiIconSymbol name="person.circle" size={28} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[
                  styles.categoryBtn, 
                  selectedCategory === cat && styles.categoryBtnActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Market List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#00F5FF" style={{ marginTop: 40 }} />
          ) : (
            filteredMarkets.map((market) => (
              <TouchableOpacity 
                key={market.id} 
                style={styles.marketCard}
                onPress={() => router.push(`/prediction-detail?id=${market.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.leagueTag}>
                    <Text style={styles.leagueName}>{market.league}</Text>
                  </View>
                  <View style={styles.timeTag}>
                    <UiIconSymbol name="clock.fill" size={12} color="#8E8E93" />
                    <Text style={styles.matchTime}>{market.time} (UTC)</Text>
                  </View>
                </View>

                <View style={styles.teamsMainContainer}>
                  <View style={styles.teamColumn}>
                    <View style={styles.logoWrapper}>
                      {market.image ? (
                        <Image source={{ uri: market.image }} style={styles.teamLogoLarge} />
                      ) : (
                        <View style={[styles.teamLogoLarge, styles.logoPlaceholder]}>
                          <UiIconSymbol name="sportscourt" size={24} color="#8E8E93" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.teamLabel} numberOfLines={1}>{market.match_name.split(' vs ')[0]}</Text>
                  </View>

                  <Text style={styles.vsTextLarge}>VS</Text>

                  <View style={styles.teamColumn}>
                    <View style={styles.logoWrapper}>
                      {market.away_image ? (
                        <Image source={{ uri: market.away_image }} style={styles.teamLogoLarge} />
                      ) : (
                        <View style={[styles.teamLogoLarge, styles.logoPlaceholder]}>
                          <UiIconSymbol name="sportscourt" size={24} color="#8E8E93" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.teamLabel} numberOfLines={1}>{market.match_name.split(' vs ')[1]}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.oddsContainer}>
                  <TouchableOpacity style={styles.oddButton}>
                    <Text style={styles.oddIndicator}>1</Text>
                    <Text style={styles.oddValue}>{market.odds.home}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.oddButton}>
                    <Text style={styles.oddIndicator}>2</Text>
                    <Text style={styles.oddValue}>{market.odds.away}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.betNowButton}>
                  <Text style={styles.betNowText}>PLACE PREDICTION</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1B2E',
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  categoryBtnActive: {
    backgroundColor: '#00F5FF20',
    borderColor: '#00F5FF',
  },
  categoryText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#00F5FF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  marketCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leagueTag: {
    backgroundColor: '#2D2E4550',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leagueName: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  teamsMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0B0C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D2E45',
    overflow: 'hidden',
  },
  teamLogoLarge: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  vsTextLarge: {
    color: '#444664',
    fontSize: 20,
    fontWeight: '900',
    marginHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2E45',
    marginBottom: 20,
  },
  oddsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  oddButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D2E45',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  oddIndicator: {
    color: '#8E8E93',
    fontWeight: 'bold',
    fontSize: 12,
  },
  oddValue: {
    color: '#00F5FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  betNowButton: {
    backgroundColor: '#00F5FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  betNowText: {
    color: '#0B0C1E',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
