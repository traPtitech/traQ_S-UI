import { defineGetters } from 'direct-vuex'
import { Channel } from '@traptitech/traq'
import { S } from './state'
import { moduleGetterContext } from '/@/vuex'
import { channelTree } from './index'

const getterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, channelTree)

export const getters = defineGetters<S>()({
  topLevelChannels(...args): Channel[] {
    const { rootState } = getterContext(args)
    return [...rootState.entities.channelsMap.values()].filter(
      channel => channel.parentId === undefined || channel.parentId === null
    )
  },
  forcedChannels(...args): Channel[] {
    const { rootState } = getterContext(args)
    return [...rootState.entities.channelsMap.values()].filter(
      channel => channel.force
    )
  }
})
