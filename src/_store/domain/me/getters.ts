import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { StampId, ChannelId } from '@/types/entity-ids'
import { moduleGetterContext } from '@/_store'
import { me } from '.'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import store from '@/store'

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
  subscribedChannels(state): ChannelId[] {
    return [...store.state.entities.channelsMap.values()]
      .filter(
        c =>
          (state.subscriptionMap[c.id] ?? ChannelSubscribeLevel.none) !==
          ChannelSubscribeLevel.none
      )
      .map(c => c.id)
  }
})
