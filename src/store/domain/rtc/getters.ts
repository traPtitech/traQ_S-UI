import { defineGetters } from 'direct-vuex'
import { S, SessionType } from './state'
import { rtc } from '.'
import { moduleGetterContext } from '@/store'
import { ChannelId } from '@/types/entity-ids'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  channelRTCSessionId: state => (
    sessionType: SessionType,
    channelId: ChannelId
  ) => {
    const sessionIds = state.channelSessionsMap.get(channelId)
    if (!sessionIds) return
    return [...sessionIds].find(
      sessionId => state.sessionInfoMap.get(sessionId)?.type === sessionType
    )
  }
})
