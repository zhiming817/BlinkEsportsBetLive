import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  liveBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 24,
  },
  liveText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  teamItem: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    padding: 12,
    backgroundColor: '#2C2C2E',
    marginBottom: 12,
  },
  teamLogo: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  vsText: {
    color: '#8E8E93',
    fontSize: 20,
    fontWeight: '300',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderColor: '#00F5FF',
  },
  optionTeamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionOdds: {
    color: '#8E8E93',
    fontSize: 12,
  },
  oddsValue: {
    color: '#00F5FF',
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  statsText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  poolInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  solIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  poolLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  pdaRow: {
    marginBottom: 24,
  },
  pdaTitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  pdaAddress: {
    color: '#5AC8FA',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: '#2C2C2E',
    color: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.12)',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    backgroundColor: '#2C2C2E',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderColor: '#00F5FF',
  },
  presetChipText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#00F5FF',
  },
  betButton: {
    backgroundColor: '#00F5FF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  betButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  retryText: {
    color: '#00F5FF',
    fontSize: 16,
  },
  backLink: {
    color: '#8E8E93',
    fontSize: 16,
  }
});
