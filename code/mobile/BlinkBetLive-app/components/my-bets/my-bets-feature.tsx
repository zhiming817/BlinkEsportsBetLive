import { AppPage } from '@/components/app-page'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'

export function MyBetsFeature() {
  return (
    <AppPage>
      <AppView className="flex-1 justify-center items-center">
        <AppText className="text-2xl font-bold">My Bets</AppText>
        <AppText>Track your history here</AppText>
      </AppView>
    </AppPage>
  )
}
