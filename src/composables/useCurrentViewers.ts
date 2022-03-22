import { ChannelViewer, ChannelViewState } from '@traptitech/traq'
import { ref, computed, Ref } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { wsListener } from '/@/lib/websocket'
import { useMeStore } from '/@/store/domain/me'

const useCurrentViewers = (channelId: Ref<ChannelId>) => {
  const meStore = useMeStore()

  /** チャンネルを見ている人の一覧(古い順) */
  const currentViewers = ref<ChannelViewer[]>([])

  /**
   * チャンネルを見ている人(入力中も含む)のIDの一覧(古い順)
   */
  const viewingUsers = computed(() =>
    currentViewers.value
      .filter(
        v => v.state === ChannelViewState.Monitoring || ChannelViewState.Editing
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

  wsListener.on('CHANNEL_VIEWERS_CHANGED', ({ id, viewers }) => {
    if (channelId.value === id) {
      currentViewers.value = viewers
    }
  })
  // NOTE: 再接続時にはCHANNEL_VIEWERS_CHANGEDが送られてくる

  return { viewingUsers, typingUsers }
}

export default useCurrentViewers
