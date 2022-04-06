import { ChannelViewState } from '@traptitech/traq'
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { changeViewState } from '/@/lib/websocket'
import { RouteName } from '/@/router'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useMainViewStore } from '/@/store/ui/mainView'

const useViewStateSender = () => {
  const route = useRoute()
  const { primaryView } = useMainViewStore()
  const { shouldReceiveLatestMessages, isTyping } = useViewStateSenderStore()

  const currentChannelId = computed(() => {
    // ルートがチャンネルでないときは閲覧チャンネルをnullにするため
    if (route.name !== RouteName.Channel && route.name !== RouteName.User) {
      return undefined
    }
    if (
      primaryView.value.type === 'channel' ||
      primaryView.value.type === 'dm'
    ) {
      return primaryView.value.channelId
    }
    return undefined
  })

  const state = computed(() => {
    if (!shouldReceiveLatestMessages.value) return ChannelViewState.None
    // 最新メッセージ閲覧中でない場合はタイピング中でもEditingにしてはいけない
    // (Editingにすると未読に追加されなくなるため)
    return isTyping.value
      ? ChannelViewState.Editing
      : ChannelViewState.Monitoring
  })

  watchEffect(() => {
    if (!currentChannelId.value) {
      changeViewState(null)
      return
    }
    changeViewState(currentChannelId.value, state.value)
  })
}

export default useViewStateSender
