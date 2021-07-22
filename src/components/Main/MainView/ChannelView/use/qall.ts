import store from '/@/store'
import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useToastStore from '/@/providers/toastStore'

const useQall = (props: { channelId: ChannelId }) => {
  const { addErrorToast } = useToastStore()

  const isQallSessionOpened = computed(() =>
    [...store.state.domain.rtc.sessionInfoMap.values()].some(
      s => s?.channelId === props.channelId && s?.type === 'qall'
    )
  )
  const hasActiveQallSession = computed(() => {
    return !!store.getters.domain.rtc.qallSession
  })
  const isJoinedQallSession = computed(
    () =>
      hasActiveQallSession.value &&
      store.getters.domain.rtc.currentRTCState?.channelId === props.channelId
  )
  const isJoinedWithCurrentDevice = computed(
    () => store.getters.app.rtc.isCurrentDevice
  )

  const startQallOnCurrentChannel = () => {
    try {
      store.dispatch.app.rtc.startQall(props.channelId)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Qallの開始に失敗しました', e)

      addErrorToast('Qallの開始に失敗しました')
    }
  }
  const endQall = () => {
    store.dispatch.app.rtc.endQall()
  }
  const toggleQall = () => {
    if (isJoinedQallSession.value) {
      if (isJoinedWithCurrentDevice.value) {
        endQall()
      }
    } else {
      startQallOnCurrentChannel()
    }
  }
  return {
    hasActiveQallSession,
    isJoinedQallSession,
    isQallSessionOpened,
    isJoinedWithCurrentDevice,
    toggleQall
  }
}
export default useQall
