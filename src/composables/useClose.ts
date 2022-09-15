import {
  constructChannelPath,
  constructClipFoldersPath,
  constructUserPath
} from '/@/router'
import { useRouter } from 'vue-router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import useChannelPath from '/@/composables/useChannelPath'
import { useMainViewStore } from '/@/store/ui/mainView'

const useClose = () => {
  const router = useRouter()

  const { primaryView } = useMainViewStore()
  const { defaultChannelName } = useBrowserSettings()
  const { channelIdToPathString } = useChannelPath()

  const close = () => {
    switch (primaryView.value.type) {
      case 'channel': {
        try {
          const channelPath = channelIdToPathString(primaryView.value.channelId)
          router.push(constructChannelPath(channelPath))
        } catch {
          router.push(constructChannelPath(defaultChannelName.value))
        }
        break
      }
      case 'clips':
        router.push(constructClipFoldersPath(primaryView.value.clipFolderId))
        break
      case 'dm':
        router.push(constructUserPath(primaryView.value.userName))
        break
      default: {
        const check: never = primaryView.value
        throw new Error(`Unknown view type:${check}`)
      }
    }
  }
  return { close }
}
export default useClose
