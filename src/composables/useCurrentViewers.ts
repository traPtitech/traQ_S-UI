import type { ChannelViewer } from '@traptitech/traq'
import { ChannelViewState } from '@traptitech/traq'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import { wsListener } from '/@/lib/websocket'
import { useMeStore } from '/@/store/domain/me'
import useMittListener from '/@/composables/utils/useMittListener'

const useCurrentViewers = (channelId: Ref<ChannelId>) => {
  const meStore = useMeStore()

  /** チャンネルを見ている人の一覧(古い順) */
  const currentViewers = ref<ChannelViewer[]>([])

  /**
   * チャンネルを見ている人(入力中を含む、バックグラウンド表示を除く)のIDの一覧(古い順)
   */
  const activeViewingUsers = computed(() =>
    currentViewers.value
      .filter(
        v =>
          v.state === ChannelViewState.Monitoring ||
          v.state === ChannelViewState.Editing ||
          v.userId === meStore.myId.value
      )
      .map(v => v.userId)
  )

  const inactiveViewingUsers = computed(() =>
    currentViewers.value
      .filter(
        v =>
          v.state === ChannelViewState.None && v.userId !== meStore.myId.value
      )
      .map(v => v.userId)
  )

  /**
   * チャンネルで入力中の人のIDの一覧(新しい順)
   */
  const typingUsers = computed(() => {
    const myId = meStore.myId.value
    return currentViewers.value
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
      .reverse()
  })

  useMittListener(wsListener, 'CHANNEL_VIEWERS_CHANGED', ({ id, viewers }) => {
    if (channelId.value === id) {
      currentViewers.value = viewers
    }
  })
  // NOTE: 再接続時にはCHANNEL_VIEWERS_CHANGEDが送られてくる

  return { activeViewingUsers, typingUsers, inactiveViewingUsers }
}

export default useCurrentViewers
