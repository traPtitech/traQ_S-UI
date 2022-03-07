import store from '/@/vuex'
import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useToastStore from '/@/providers/toastStore'
import { useAppRtcStore } from '/@/store/app/rtc'

const useQall = (props: { channelId: ChannelId }) => {
  const {
    isCurrentDevice: isJoinedWithCurrentDevice,
    startQall,
    endQall
  } = useAppRtcStore()
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

  const startQallOnCurrentChannel = async () => {
    try {
      await startQall(props.channelId)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Qallの開始に失敗しました', e)

      addErrorToast('Qallの開始に失敗しました')
    }
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
