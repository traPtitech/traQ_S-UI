import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useToastStore from '/@/providers/toastStore'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useDomainRtcStore } from '/@/store/domain/rtc'

const useQall = (props: { channelId: ChannelId }) => {
  const {
    isCurrentDevice: isJoinedWithCurrentDevice,
    startQall,
    endQall
  } = useAppRtcStore()
  const { sessionInfoMap, qallSession, currentRTCState } = useDomainRtcStore()
  const { addErrorToast } = useToastStore()

  const isQallSessionOpened = computed(() =>
    [...sessionInfoMap.value.values()].some(
      s => s?.channelId === props.channelId && s?.type === 'qall'
    )
  )
  const hasActiveQallSession = computed(() => !!qallSession.value)
  const isJoinedQallSession = computed(
    () =>
      hasActiveQallSession.value &&
      currentRTCState.value?.channelId === props.channelId
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
