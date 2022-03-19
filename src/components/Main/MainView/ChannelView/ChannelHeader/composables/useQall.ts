import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { useToastStore } from '/@/store/ui/toast'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useRtcSettings } from '/@/store/app/rtcSettings'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined

const useQall = (props: { channelId: ChannelId; isArchived: boolean }) => {
  const { isEnabled: isRtcEnabled } = useRtcSettings()
  const {
    /** この端末でチャンネル問わず自分がQallに参加している */
    isCurrentDevice: isJoinedWithCurrentDevice,
    startQall,
    endQall
  } = useAppRtcStore()
  const { sessionInfoMap, qallSession, currentRTCState } = useDomainRtcStore()
  const { addErrorToast } = useToastStore()

  const isQallFeatureEnabled = computed(
    () => isSkywayApikeySet && isRtcEnabled.value
  )

  /** このチャンネルでQallが開始されている */
  const isQallSessionOpened = computed(() =>
    [...sessionInfoMap.value.values()].some(
      s => s?.channelId === props.channelId && s?.type === 'qall'
    )
  )
  /** 端末・チャンネルを問わず自分がQallに参加している */
  const hasActiveQallSession = computed(() => !!qallSession.value)
  /** 端末問わず自分がこのチャンネルのQallに参加している */
  const isJoinedQallSession = computed(
    () =>
      hasActiveQallSession.value &&
      currentRTCState.value?.channelId === props.channelId
  )

  /**
   * Qallが開始できるのは、このチャンネルがアーカイブされていなく
   * どの端末でもどのチャンネルにもQallに参加していないとき
   */
  const canStartQall = computed(
    () => !props.isArchived && !hasActiveQallSession.value
  )
  /**
   * Qallが終了できるのは、
   * 自分がこの端末でこのチャンネルのQallに参加しているとき
   */
  const canEndQall = computed(
    () => isJoinedQallSession.value && isJoinedWithCurrentDevice.value
  )
  const canToggleQall = computed(() => canStartQall.value || canEndQall.value)

  const qallIconName = computed(() =>
    isJoinedQallSession.value ? 'phone' : 'phone-outline'
  )
  const qallLabel = computed(() => {
    if (isQallSessionOpened.value) {
      if (isJoinedWithCurrentDevice.value) {
        return 'Qallを終了'
      }
      if (isJoinedQallSession.value) {
        return '別のデバイスでQall中'
      }
      return 'Qallに参加'
    }
    if (hasActiveQallSession.value) {
      return '他チャンネルでQall中'
    }
    return 'Qallを開始'
  })

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
    isQallFeatureEnabled,
    isQallSessionOpened,
    canEndQall,
    canToggleQall,
    qallIconName,
    qallLabel,
    toggleQall
  }
}
export default useQall
