import { constructChannelPath } from '/@/router'
import { useRouter } from 'vue-router'
import { useBrowserSettings } from '/@/store/app/browserSettings'

const useClose = () => {
  const router = useRouter()
  const { lastOpenChannelName } = useBrowserSettings()
  const close = () =>
    router.push(constructChannelPath(lastOpenChannelName.value))
  return { close }
}
export default useClose
