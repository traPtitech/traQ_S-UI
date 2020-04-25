import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { ChannelId } from '@/types/entity-ids'
import { WebRTCUserStateSessions } from '@traptitech/traq'

export const getters = defineGetters<S>()({
  /** チャンネルで行われているRTCセッションのマップ */
  channelSessionsMap(state): Record<ChannelId, WebRTCUserStateSessions[]> {
    return Object.fromEntries(
      Object.values(state.userStateMap).map(
        userState => [userState.channelId, userState.sessions] as const
      )
    )
  }
})
