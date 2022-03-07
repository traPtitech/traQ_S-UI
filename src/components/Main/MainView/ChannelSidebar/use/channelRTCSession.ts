import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { SessionType } from '/@/vuex/domain/rtc/state'

const useRTCSession =
  (sessionType: SessionType) => (props: { channelId: ChannelId }) => {
    const sessionId = computed(() =>
      store.getters.domain.rtc.channelRTCSessionId(sessionType, props.channelId)
    )
    const sessionUserIds = computed(() =>
      [...store.state.domain.rtc.userStateMap.entries()]
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
