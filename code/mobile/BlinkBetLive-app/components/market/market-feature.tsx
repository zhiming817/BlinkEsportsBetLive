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

  const groupMarketsByDate = (markets: MarketMatchItem[]) => {
    const groups: { [key: string]: MarketMatchItem[] } = {};
    markets.forEach(market => {
      try {
        // 后端返回的可能是 "2024-04-25 15:00:00" 这种格式，
        // 在某些 JS 引擎中直接加 " UTC" 可能解析失败
        // 尝试将其转换为标准的 ISO 格式 (T 分隔)
        const normalizedTime = market.time.replace(' ', 'T');
        const date = new Date(normalizedTime.includes('Z') || normalizedTime.includes('+') ? normalizedTime : normalizedTime + 'Z');
        
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }

        const dateKey = date.toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Asia/Shanghai'
        }).replace(/\//g, '月') + '日';
        
        // 判断是否是今天
        const today = new Date();
        const todayStr = today.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
        const currentStr = date.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
        const isToday = currentStr === todayStr;
        const displayKey = isToday ? `${dateKey} 今天` : dateKey;

        if (!groups[displayKey]) groups[displayKey] = [];
        groups[displayKey].push(market);
      } catch {
        const fallback = '其他';
        if (!groups[fallback]) groups[fallback] = [];
        groups[fallback].push(market);
      }
    });
    return groups;
  };

  const formatLocalTimeOnly = (utcDateString: string) => {
    try {
      const normalizedTime = utcDateString.replace(' ', 'T');
      const date = new Date(normalizedTime.includes('Z') || normalizedTime.includes('+') ? normalizedTime : normalizedTime + 'Z');
      if (isNaN(date.getTime())) {
        return utcDateString;
      }
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Shanghai'
      });
    } catch {
      return utcDateString;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
        return { label: '未开始', color: '#8E8E93' };
      case 'running':
        return { label: '进行中', color: '#00F5FF' };
      case 'finished':
        return { label: '已结束', color: '#4CD964' };
      default:
        return { label: status, color: '#8E8E93' };
    }
  };

  const groupedMarkets = groupMarketsByDate(filteredMarkets);

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
        <View style={styles.categoryContainer}>
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
            Object.keys(groupedMarkets).map((dateGroup) => (
              <View key={dateGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateHeaderText}>{dateGroup}</Text>
                  <View style={styles.dateLine} />
                </View>

                {groupedMarkets[dateGroup].map((market) => (
                  <TouchableOpacity 
                    key={market.id} 
                    style={styles.marketCard}
                    onPress={() => router.push(`/prediction-detail?id=${market.id}`)}
                  >
                    <View style={styles.matchMainRow}>
                      <View style={styles.timeInfo}>
                        <Text style={styles.matchTimeText} numberOfLines={1} adjustsFontSizeToFit>{formatLocalTimeOnly(market.time)}</Text>
                        <Text style={[styles.statusBadge, { color: getStatusDisplay(market.status).color }]}>
                          {getStatusDisplay(market.status).label}
                        </Text>
                        <Text style={styles.leagueNameSmall} numberOfLines={1}>{market.league}</Text>
                      </View>

                      <View style={styles.teamsContainer}>
                        <View style={styles.teamRow}>
                          <Image source={{ uri: market.image }} style={styles.teamLogoSmall} />
                          <Text style={styles.teamNameText}>{market.match_name.split(' vs ')[0]}</Text>
                        </View>
                        <View style={styles.teamRow}>
                          <Image source={{ uri: market.away_image }} style={styles.teamLogoSmall} />
                          <Text style={styles.teamNameText}>{market.match_name.split(' vs ')[1]}</Text>
                        </View>
                      </View>

                      <View style={styles.actionColumn}>
                        <View style={styles.oddsValuesSmall}>
                          <Text style={styles.oddTextSmall}>{market.odds.home}</Text>
                          <Text style={styles.oddTextSmall}>{market.odds.away}</Text>
                        </View>
                        <View style={styles.goDetailBtn}>
                          <UiIconSymbol name="chevron.right" size={16} color="#00F5FF" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
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
  categoryContainer: {
    marginBottom: 8,
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2D2E45',
    opacity: 0.5,
  },
  dateHeaderText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  marketCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  matchMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    width: 75,
    alignItems: 'flex-start',
    marginRight: 4,
  },
  matchTimeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  leagueNameSmall: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  teamsContainer: {
    flex: 1,
    gap: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#2D2E45',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLogoSmall: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  teamNameText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  actionColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  oddsValuesSmall: {
    alignItems: 'flex-end',
    gap: 12,
  },
  oddTextSmall: {
    color: '#00F5FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goDetailBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D2E45',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
