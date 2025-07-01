import { ChannelViewState } from '@traptitech/traq'
import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
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

  onMounted(() => {
    document.addEventListener('visibilitychange', visibilitychangeListener)
    window.addEventListener('focus', focusListener)
    window.addEventListener('blur', blurListener)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', visibilitychangeListener)
    window.removeEventListener('focus', focusListener)
    window.removeEventListener('blur', blurListener)
  })
}

export default useViewStateSender
