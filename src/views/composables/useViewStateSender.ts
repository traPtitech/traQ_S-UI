import { ChannelViewState } from '@traptitech/traq'
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { changeViewState } from '/@/lib/websocket'
import { RouteName } from '/@/router'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useMainViewStore } from '/@/store/ui/mainView'
import useEventListener from '/@/composables/dom/useEventListener'

const useViewStateSender = () => {
  const route = useRoute()
  const { primaryView } = useMainViewStore()
  const { shouldReceiveLatestMessages, isTyping } = useViewStateSenderStore()

  const currentChannelId = computed(() => {
    // ルートがチャンネルでないときは閲覧チャンネルをnullにするため
    if (
      route.name !== RouteName.Channel &&
      route.name !== RouteName.User &&
      route.name !== RouteName.File
    ) {
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
    if (!shouldReceiveLatestMessages.value) return ChannelViewState.StaleViewing
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

  const visibilitychangeListener = () => {
    if (!currentChannelId.value) {
      changeViewState(null)
      return
    }
    if (document.visibilityState === 'visible') {
      changeViewState(currentChannelId.value, state.value)
      return
    }
    changeViewState(currentChannelId.value, ChannelViewState.None)
  }
  const focusListener = () => {
    if (!currentChannelId.value) {
      changeViewState(null)
      return
    }
    changeViewState(currentChannelId.value, state.value)
  }

  const blurListener = () => {
    if (!currentChannelId.value) {
      changeViewState(null)
      return
    }
    changeViewState(currentChannelId.value, ChannelViewState.None)
  }

  useEventListener(document, 'visibilitychange', visibilitychangeListener)
  useEventListener(window, 'focus', focusListener)
  useEventListener(window, 'blur', blurListener)
}

export default useViewStateSender
