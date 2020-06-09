import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { StampId, ChannelId } from '@/types/entity-ids'
import { moduleGetterContext } from '@/store'
import { me } from '.'
import { ChannelSubscribeLevel } from '@traptitech/traq'

const meGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, me)

export const getters = defineGetters<S>()({
  recentStampIds(...args): StampId[] {
    const { state, rootState } = meGetterContext(args)
    const history = Object.entries(state.stampHistory)
      .filter(([stampId]) => rootState.entities.stamps[stampId] !== undefined)
      .sort((e1, e2) => {
        // 日付の降順
        if (e1[1] > e2[1]) return -1
        if (e1[1] < e2[1]) return 1
        return 0
      })
      .map(e => e[0])
    return history
  },
  subscribedChannels(...args): ChannelId[] {
    const { state, rootState } = meGetterContext(args)
    return Object.values(rootState.entities.channels)
      .filter(
        c =>
          (state.subscriptionMap[c.id] ?? ChannelSubscribeLevel.none) !==
          ChannelSubscribeLevel.none
      )
      .map(c => c.id)
  }
})
