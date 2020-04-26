import store from '@/store'
import { computed } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'

const useQall = (props: { channelId: ChannelId }) => {
  const isQallSessionOpened = computed(
    () =>
      !!Object.values(store.state.app.rtc.sessionInfoMap).find(
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
    isJoinedQallSession,
    isQallSessionOpened,
    toggleQall
  }
}
export default useQall
