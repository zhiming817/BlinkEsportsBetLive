import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { AppText } from '@/components/app-text'
import { ellipsify } from '@/utils/ellipsify'
import { AppView } from '@/components/app-view'
import { AppPage } from '@/components/app-page'
import { AccountUiButtons } from './account-ui-buttons'
import { AccountUiBalance } from '@/components/wallet/account-ui-balance'
import { AccountUiTokenAccounts } from '@/components/wallet/account-ui-token-accounts'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View, Text } from 'react-native'
import { useCallback, useState } from 'react'
import { useGetBalanceInvalidate } from '@/components/wallet/use-get-balance'
import { PublicKey } from '@solana/web3.js'
import { useGetTokenAccountsInvalidate } from '@/components/wallet/use-get-token-accounts'
import { WalletUiButtonConnect } from '@/components/solana/wallet-ui-button-connect'
import { router } from 'expo-router'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'

export function AccountFeature() {
  const { account } = useMobileWallet()
  const [refreshing, setRefreshing] = useState(false)
  const invalidateBalance = useGetBalanceInvalidate({ address: account?.publicKey as PublicKey })
  const invalidateTokenAccounts = useGetTokenAccountsInvalidate({ address: account?.publicKey as PublicKey })
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([invalidateBalance(), invalidateTokenAccounts()])
    setRefreshing(false)
  }, [invalidateBalance, invalidateTokenAccounts])

  return (
    <AppPage style={{ backgroundColor: '#0B0C1E' }}>
      <AppView
        style={{
          backgroundColor: '#0B0C1E',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <AppText className="text-2xl font-bold" lightColor="#FFFFFF" darkColor="#FFFFFF">
          Wallet
        </AppText>
        <Pressable onPress={() => router.push('/settings')}>
          <UiIconSymbol name="gearshape.fill" size={24} color="#FFFFFF" />
        </Pressable>
      </AppView>
      {account ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} />}
        >
          <AppView style={{ backgroundColor: '#0B0C1E', alignItems: 'center', gap: 4 }}>
            <AccountUiBalance address={account.publicKey} />
            <AppText lightColor="#B8C1D9" darkColor="#B8C1D9" style={{ opacity: 0.9 }}>
              {ellipsify(account.publicKey.toString(), 8)}
            </AppText>
          </AppView>
          <AppView style={{ backgroundColor: '#0B0C1E', marginTop: 16, alignItems: 'center' }}>
            <AccountUiButtons />
          </AppView>
          <AppView style={{ backgroundColor: '#0B0C1E', marginTop: 16, alignItems: 'center' }}>
            <AccountUiTokenAccounts address={account.publicKey} />
          </AppView>
        </ScrollView>
      ) : (
        <AppView style={{ backgroundColor: '#0B0C1E', flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
          <AppText lightColor="#FFFFFF" darkColor="#FFFFFF">Connect your wallet.</AppText>
          <WalletUiButtonConnect />
        </AppView>
      )}
    </AppPage>
  )
}
