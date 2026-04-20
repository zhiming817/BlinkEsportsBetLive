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
    <AppPage>
      <AppView className="flex-row justify-between items-center px-4 py-2">
        <AppText className="text-2xl font-bold">Wallet</AppText>
        <Pressable onPress={() => router.push('/settings')}>
          <UiIconSymbol name="gearshape.fill" size={24} color="#000" />
        </Pressable>
      </AppView>
      {account ? (
        <ScrollView
          contentContainerStyle={{}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} />}
        >
          <AppView style={{ alignItems: 'center', gap: 4 }}>
            <AccountUiBalance address={account.publicKey} />
            <AppText style={{ opacity: 0.7 }}>{ellipsify(account.publicKey.toString(), 8)}</AppText>
          </AppView>
          <AppView style={{ marginTop: 16, alignItems: 'center' }}>
            <AccountUiButtons />
          </AppView>
          <AppView style={{ marginTop: 16, alignItems: 'center' }}>
            <AccountUiTokenAccounts address={account.publicKey} />
          </AppView>
        </ScrollView>
      ) : (
        <AppView style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
          <AppText>Connect your wallet.</AppText>
          <WalletUiButtonConnect />
        </AppView>
      )}
    </AppPage>
  )
}
