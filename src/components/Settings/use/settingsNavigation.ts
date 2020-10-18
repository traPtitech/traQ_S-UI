import { RouteName } from '@/router'
import store from '@/store'
import { useRouter } from 'vue-router'

const useCloseSettings = () => {
  const router = useRouter()
  const close = () =>
    router.push({ name: RouteName.Index, query: { lastOpen: 'true' } })
  const back = () => {
    if (store.state.ui.settings.settingsRootShown) {
      router.back()
    } else {
      router.push({ name: RouteName.Settings })
    }
  }
  return { close, back }
}

export default useCloseSettings
