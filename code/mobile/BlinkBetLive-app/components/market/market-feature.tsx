import { AppPage } from '@/components/app-page'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'

export function MarketFeature() {
  return (
    <AppPage>
      <AppView className="flex-1 justify-center items-center">
        <AppText className="text-2xl font-bold">Market</AppText>
        <AppText>Marketplace is coming soon</AppText>
      </AppView>
    </AppPage>
  )
}
