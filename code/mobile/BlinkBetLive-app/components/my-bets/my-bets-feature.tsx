import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { PredictionCard } from './prediction-card'
import predictionsData from '@/assets/data/predictions.json'

export function MyBetsFeature() {
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active')

  const currentData = activeTab === 'Active' ? predictionsData.active : predictionsData.history

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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {currentData.map((item) => (
            <PredictionCard key={item.id} item={item} />
          ))}
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
