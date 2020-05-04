import { defineGetters } from 'direct-vuex'
import { S, SessionType } from './state'
import { ChannelId } from '@/types/entity-ids'

export const getters = defineGetters<S>()({
  qallSession(state) {
    return state.currentRTCState?.sessionStates.find(
      s => state.sessionInfoMap[s.sessionId]?.type === 'qall'
    )
  },
  channelRTCSessionId: state => (
    sessionType: SessionType,
    channelId: ChannelId
  ) => {
    return state.channelSessionsMap[channelId]?.find(
      sessionId => state.sessionInfoMap[sessionId]?.type === sessionType
    )
  }
})
