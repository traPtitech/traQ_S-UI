import { ChannelId } from '@/types/entity-ids'
import { computed } from '@vue/composition-api'
import store from '@/store'

const useScreenShare = (props: { channelId: ChannelId }) => {
  const isScreenShareSessionOpened = computed(() =>
    Object.values(store.state.app.rtc.sessionInfoMap).some(
      s => s?.channelId === props.channelId && s?.type === 'video'
    )
  )
  const hasActiveScreenShareSession = computed(() => {
    return !!store.getters.app.rtc.videoSession
  })
  const isJoinedScreenShareSession = computed(
    () =>
      hasActiveScreenShareSession.value &&
      store.state.app.rtc.currentRTCState?.channelId === props.channelId
  )
  const startScreenCasting = async () => {
    try {
      await store.dispatch.app.rtc.startVideoCasting(props.channelId)
    } catch {
      window.alert('画面共有の開始に失敗しました')
    }
  }
  const startScreenStreaming = async () => {
    await store.dispatch.app.rtc.startVideoStreaming(props.channelId)
  }
  const endScreenShareSession = async () => {
    await store.dispatch.app.rtc.endVideoSession()
  }
  const toggleScreenSharing = async () => {
    if (isJoinedScreenShareSession.value) {
      endScreenShareSession()
      store.dispatch.ui.mainView.resetSecondaryView()
    } else if (isScreenShareSessionOpened.value) {
      startScreenStreaming()
      store.dispatch.ui.mainView.changeSecondaryViewToQall()
    } else if (hasActiveScreenShareSession.value) {
      return
    } else {
      startScreenCasting()
    }
  }
  return {
    toggleScreenSharing,
    hasActiveScreenShareSession,
    isJoinedScreenShareSession,
    isScreenShareSessionOpened
  }
}

export default useScreenShare
