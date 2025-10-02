import { computed, watchEffect } from 'vue'
import { useMainViewStore } from '/@/store/ui/mainView'
import useChannelPath from '/@/composables/useChannelPath'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const appName = window.traQConfig.name || 'traQ'

const useDocumentTitle = () => {
  const { primaryView } = useMainViewStore()
  const { clipFoldersMap } = useClipFoldersStore()
  const { channelIdToShortPathString } = useChannelPath()

  const primaryViewTitle = computed(() => {
    switch (primaryView.value.type) {
      case 'channel':
        try {
          const channel = channelIdToShortPathString(
            primaryView.value.channelId,
            true
          )
          if (channel) return channel
          return ''
        } catch {
          return ''
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
    const pre = primaryViewTitle.value
    document.title = pre ? `${pre} - ${appName}` : appName
  })
}

export default useDocumentTitle
