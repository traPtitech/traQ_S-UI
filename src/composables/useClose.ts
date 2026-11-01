import { useRouter } from 'vue-router'

import useChannelPath from '/@/composables/useChannelPath'
import {
  constructChannelPath,
  constructClipFoldersPath,
  constructUserPath
} from '/@/router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useMainViewStore } from '/@/store/ui/mainView'

const useClose = () => {
  const router = useRouter()

  const { primaryView } = useMainViewStore()
  const { startupChannelPath } = useBrowserSettings()
  const { channelIdToLink } = useChannelPath()

  const close = async () => {
    switch (primaryView.value.type) {
      case 'channel':
      case 'thread': {
        const channelId = primaryView.value.channelId

        const link = await channelIdToLink(channelId)
        router.push(link ?? constructChannelPath(startupChannelPath.value))

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
