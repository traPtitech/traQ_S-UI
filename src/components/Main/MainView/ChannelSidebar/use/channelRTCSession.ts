import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { computed } from 'vue'
import { SessionType } from '@/store/app/rtc/state'

const useRTCSession = (sessionType: SessionType) => (props: {
  channelId: ChannelId
}) => {
  const sessionId = computed(() =>
    store.getters.app.rtc.channelRTCSessionId(sessionType, props.channelId)
  )
  const sessionUserIds = computed(() =>
    Object.entries(store.state.app.rtc.userStateMap)
      .filter(([_, userState]) =>
        userState?.sessionStates.some(
          sessionState => sessionState.sessionId === sessionId.value
        )
      )
      .map(([userId, _]) => userId)
  )
  return { sessionId, sessionUserIds }
}

export const useQallSession = useRTCSession('qall')
