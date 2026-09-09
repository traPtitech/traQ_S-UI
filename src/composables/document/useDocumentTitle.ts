import { computed, watchEffect } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import { setFallbackForNullishOrOnError } from '/@/lib/basic/fallback'
import { isolateBidiText } from '/@/lib/basic/string'
import { fallbackChannelPath } from '/@/lib/config'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import { useMainViewStore } from '/@/store/ui/mainView'

const appName = window.traQConfig.name || 'traQ'
const LRM = String.fromCodePoint(0x200e)

const useDocumentTitle = () => {
  const { primaryView } = useMainViewStore()
  const { clipFoldersMap } = useClipFoldersStore()
  const { channelIdToShortPathString } = useChannelPath()

  const primaryViewTitle = computed(() => {
    switch (primaryView.value.type) {
      case 'channel': {
        const channelId = primaryView.value.channelId

        return setFallbackForNullishOrOnError(fallbackChannelPath).exec(() =>
          channelIdToShortPathString(channelId, true)
        )
      }

      case 'dm':
        return `@${primaryView.value.userName}`

      case 'clips':
        return (
          clipFoldersMap.value.get(primaryView.value.clipFolderId)?.name ??
          'Unknown'
        )
    }
    const check: never = primaryView.value
    throw new Error(`Unexpected primaryView: ${check}`)
  })

  watchEffect(() => {
    // ユーザー入力の文字方向が document.title 全体の表示方向に影響しないようにする
    const isolatedPre = primaryViewTitle.value
      ? isolateBidiText(primaryViewTitle.value)
      : ''
    document.title = isolatedPre ? `${LRM}${isolatedPre} - ${appName}` : appName
  })
}

export default useDocumentTitle
