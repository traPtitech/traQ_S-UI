import { constructChannelPath } from '/@/router'
import store from '/@/vuex'
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
