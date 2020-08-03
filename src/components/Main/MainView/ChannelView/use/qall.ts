import store from '@/store'
import { computed } from 'vue'
import { ChannelId } from '@/types/entity-ids'

const useQall = (props: { channelId: ChannelId }) => {
  const isQallSessionOpened = computed(() =>
    Object.values(store.state.app.rtc.sessionInfoMap).some(
      s => s?.channelId === props.channelId && s?.type === 'qall'
    )
  )
  const hasActiveQallSession = computed(() => {
    return !!store.getters.app.rtc.qallSession
  })
  const isJoinedQallSession = computed(
    () =>
      hasActiveQallSession.value &&
      store.state.app.rtc.currentRTCState?.channelId === props.channelId
  )
  const startQallOnCurrentChannel = () => {
    store.dispatch.app.rtc.startQall(props.channelId)
  }
  const endQall = () => {
    store.dispatch.app.rtc.endQall()
  }
  const toggleQall = () => {
    if (isJoinedQallSession.value) {
      endQall()
    } else {
      startQallOnCurrentChannel()
    }
  }
  return {
    hasActiveQallSession,
    isJoinedQallSession,
    isQallSessionOpened,
    toggleQall
  }
}
export default useQall
