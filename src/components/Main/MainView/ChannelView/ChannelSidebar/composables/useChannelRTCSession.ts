import { ChannelId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { useDomainRtcStore, SessionType } from '/@/store/domain/rtc'

const useRTCSession =
  (sessionType: SessionType) => (props: { channelId: ChannelId }) => {
    const { userStateMap, getChannelRTCSessionId } = useDomainRtcStore()

    const sessionId = computed(() =>
      getChannelRTCSessionId(sessionType, props.channelId)
    )
    const sessionUserIds = computed(() =>
      [...userStateMap.value.entries()]
        .filter(([_, userState]) =>
          userState.sessionStates.some(
            sessionState => sessionState.sessionId === sessionId.value
          )
        )
        .map(([userId, _]) => userId)
    )
    return { sessionId, sessionUserIds }
  }

export const useQallSession = useRTCSession('qall')
