import store from '@/store'
import { computed } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'

const useQall = (props: { channelId: ChannelId }) => {
  const hasActiveQallSession = computed(
    () => !!store.state.app.rtc.currentRTCSessions.find(s => s.state === 'qall')
  )
  const isQallSessionOpened = computed(
    () =>
      !!store.getters.app.rtc.channelSessionsMap[props.channelId]?.find(
        s => s.state === 'qall'
      )
  )
  const isJoinedQallSession = computed(
    () =>
      hasActiveQallSession.value &&
      store.state.app.rtc.currentRTCChannel === props.channelId
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
