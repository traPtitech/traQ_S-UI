import { constructChannelPath } from '@/router'
import store from '@/store'
import { useRouter } from 'vue-router'

const useClose = () => {
  const router = useRouter()
  const close = () =>
    router.push(
      constructChannelPath(store.state.app.browserSettings.lastOpenChannelName)
    )
  return { close }
}
export default useClose
