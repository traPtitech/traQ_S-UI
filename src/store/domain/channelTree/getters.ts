import { defineGetters } from 'direct-vuex'
import { Channel } from '@traptitech/traq'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { channelTree } from './index'
import store from '@/store'

const getterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, channelTree)

export const getters = defineGetters<S>()({
  topLevelChannels(): Channel[] {
    return [...store.state.entities.channelsMap.values()].filter(
      channel => channel.parentId === undefined || channel.parentId === null
    )
  }
})
