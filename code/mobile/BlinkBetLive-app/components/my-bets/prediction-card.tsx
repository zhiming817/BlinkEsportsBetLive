import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol';

export function PredictionCard({ item }: { item: any }) {
  const isSettled = item.status === 'SETTLED';
  const isWon = item.result === 'WON';
  const isActive = item.status === 'ACTIVE';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.statusText}>{item.status}</Text>
        {isSettled && (
          <View style={[styles.badge, isWon ? styles.badgeWon : styles.badgeLost]}>
            <Text style={[styles.badgeText, isWon ? styles.textWon : styles.textLost]}>
              {item.result}
            </Text>
            <UiIconSymbol 
              name={isWon ? "checkmark.circle.fill" : "xmark.circle.fill"} 
              size={12} 
              color={isWon ? "#4ADE80" : "#F87171"} 
            />
          </View>
        )}
      </View>

      <Text style={styles.matchTitle}>{item.match}</Text>
      <Text style={styles.leagueText}>{item.league}</Text>
      
      <View style={styles.divider} />

      {isActive && item.progress !== undefined && (
        <View style={styles.progressContainer}>
           <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
           </View>
           <Text style={styles.progressText}>Match in Progress - {item.matchTime}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Prediction:</Text>
        <Text style={styles.value}>{item.prediction}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Wager:</Text>
        <Text style={styles.value}>{item.wager}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>
          {item.profit ? 'Profit:' : item.loss ? 'Loss:' : 'Potential Win:'}
        </Text>
        <Text style={[styles.value, styles.bold, item.profit ? styles.textWon : item.loss ? styles.textLost : styles.textWhite]}>
          {item.profit || item.loss || item.potentialWin}
        </Text>
      </View>

      {isSettled && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Settled: {item.settledTime}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1B2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2E45',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeWon: {
    backgroundColor: '#1C3A2F',
  },
  badgeLost: {
    backgroundColor: '#3A1C1C',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 4,
  },
  matchTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  leagueText: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2E45',
    marginVertical: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#2D2E45',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F5FF',
  },
  progressText: {
    color: '#00F5FF',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#8E8E93',
    fontSize: 12,
  },
  value: {
    color: 'white',
    fontSize: 12,
  },
  bold: {
    fontWeight: '700',
  },
  textWon: {
    color: '#4ADE80',
  },
  textLost: {
    color: '#F87171',
  },
  textWhite: {
    color: 'white',
  },
  footer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 10,
  },
});
