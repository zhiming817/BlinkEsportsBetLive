import { AppPage } from '@/components/app-page'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'

export function HomeFeature() {
  return (
    <AppPage>
      <AppView className="flex-1 justify-center items-center">
        <AppText className="text-2xl font-bold">Home</AppText>
        <AppText>Welcome to BlinkBetLive</AppText>
      </AppView>
    </AppPage>
  )
}
