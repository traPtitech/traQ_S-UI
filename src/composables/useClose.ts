import { useRouter } from 'vue-router'

import useChannelPath from '/@/composables/useChannelPath'
import {
  constructChannelPath,
  constructClipFoldersPath,
  constructUserPath
} from '/@/router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useMainViewStore } from '/@/store/ui/mainView'

import { setFallbackForNullishOrOnError } from '../lib/basic/fallback'

const useClose = () => {
  const router = useRouter()

  const { primaryView } = useMainViewStore()
  const { startupChannelPath } = useBrowserSettings()
  const { channelIdToPathString } = useChannelPath()

  const close = () => {
    switch (primaryView.value.type) {
      case 'channel': {
        const channelId = primaryView.value.channelId

        const channelPath = setFallbackForNullishOrOnError(
          startupChannelPath.value
        ).exec(() => channelIdToPathString(channelId))

        router.push(constructChannelPath(channelPath))

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
