import React, { PropsWithChildren } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppView } from '@/components/app-view'
import type { ViewProps } from 'react-native'

export function AppPage({ children, ...props }: PropsWithChildren<ViewProps>) {
  const { style, ...restProps } = props

  return (
    <AppView {...restProps} style={[{ flex: 1 }, style]}>
      <SafeAreaView style={{ flex: 1, gap: 16, paddingHorizontal: 16 }}>{children}</SafeAreaView>
    </AppView>
  )
}
