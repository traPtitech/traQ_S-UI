import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { StampId, ChannelId } from '/@/types/entity-ids'
import { moduleGetterContext } from '/@/store'
import { me } from '.'
import { ChannelSubscribeLevel, ChannelViewState } from '@traptitech/traq'

const meGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, me)

export const getters = defineGetters<S>()({
  myId(state) {
    return state.detail?.id
  },

  recentStampIds(...args): StampId[] {
    const { state, rootState } = meGetterContext(args)
    const history = [...state.stampHistory.entries()]
      .filter(([stampId]) => rootState.entities.stampsMap.has(stampId))
      .sort((e1, e2) => {
        // 日付の降順
        if (e1[1] > e2[1]) return -1
        if (e1[1] < e2[1]) return 1
        return 0
      })
      .map(e => e[0])
    return history
  },
  subscribedChannels(...args): Set<ChannelId> {
    const { state, rootState } = meGetterContext(args)
    return new Set(
      [...state.subscriptionMap.entries()]
        .filter(
          ([id, level]) =>
            rootState.entities.channelsMap.has(id) &&
            level !== ChannelSubscribeLevel.none
        )
        .map(([id]) => id)
    )
  },
  isChannelSubscribed(state): (channelId: ChannelId) => boolean {
    return channelId =>
      (state.subscriptionMap.get(channelId) ?? ChannelSubscribeLevel.none) !==
      ChannelSubscribeLevel.none
  },

  monitoringChannels(state): Set<ChannelId> {
    return new Set(
      [...state.viewStates.values()]
        .filter(
          vs =>
            vs.state === ChannelViewState.Monitoring ||
            vs.state === ChannelViewState.Editing
        )
        .map(vs => vs.channelId)
    )
  }
})
