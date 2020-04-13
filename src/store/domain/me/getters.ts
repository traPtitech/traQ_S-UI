import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { StampId, ChannelId } from '@/types/entity-ids'
import { moduleGetterContext } from '@/store'
import { me } from '.'

const meGetterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, me)

export const getters = defineGetters<S>()({
  recentStampIds(state): StampId[] {
    const history = Object.entries(state.stampHistory)
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
      .filter(c => (state.subscriptionMap[c.id] ?? 'none') !== 'none')
      .map(c => c.id)
  }
})
