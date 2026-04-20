import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';
import marketsData from '@/assets/data/markets.json';

export function MarketFeature() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredMarkets = selectedCategory === 'All' 
    ? marketsData.markets 
    : marketsData.markets.filter(m => m.category === selectedCategory);

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
            {marketsData.categories.map((cat) => (
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
          {filteredMarkets.map((market) => (
            <View key={market.id} style={styles.marketCard}>
              <View style={styles.cardHeader}>
                <View style={styles.teamInfo}>
                  <Image source={{ uri: market.image }} style={styles.teamLogo} />
                  <View>
                    <Text style={styles.matchName}>{market.match}</Text>
                    <Text style={styles.leagueName}>{market.league}</Text>
                  </View>
                </View>
                <Text style={styles.matchTime}>{market.time}</Text>
              </View>

              <View style={styles.oddsContainer}>
                <TouchableOpacity style={styles.oddButton}>
                  <Text style={styles.oddTeam}>1</Text>
                  <Text style={styles.oddValue}>{market.odds.home}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.oddButton}>
                  <Text style={styles.oddTeam}>2</Text>
                  <Text style={styles.oddValue}>{market.odds.away}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.betNowButton}>
                <Text style={styles.betNowText}>Bet Now</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2E45',
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  leagueName: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  matchTime: {
    fontSize: 10,
    color: '#8E8E93',
    backgroundColor: '#2D2E45',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    paddingVertical: 12,
    borderRadius: 12,
  },
  oddTeam: {
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  oddValue: {
    color: '#00F5FF',
    fontWeight: 'bold',
  },
  betNowButton: {
    backgroundColor: '#00F5FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  betNowText: {
    color: '#0B0C1E',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
