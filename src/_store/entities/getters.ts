import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { entities, StampMap } from '.'
import { moduleGetterContext } from '@/_store'
import { Stamp } from '@traptitech/traq'
import { UserId, DMChannelId } from '@/types/entity-ids'
import store from '@/store'

const entitiesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({
  stampNameTable(state) {
    return Object.fromEntries(
      Object.values(state.stamps as StampMap).map(stamp => [stamp.name, stamp])
    )
  },
  stampByName(...args): (name: string) => Stamp | undefined {
    const { getters } = entitiesGetterContext(args)
    return name => getters.stampNameTable[name]
  },
  userNameByDMChannelId(state): (id: DMChannelId) => string | undefined {
    return id =>
      store.state.entities.usersMap.get(state.dmChannels[id].userId)?.name
  },
  DMChannelUserIdTable(state) {
    return Object.fromEntries(
      Object.values(state.dmChannels).map(c => [c.userId, c.id])
    )
  },
  DMChannelIdByUserId(...args): (id: UserId) => DMChannelId | undefined {
    const { getters } = entitiesGetterContext(args)
    return id => getters.DMChannelUserIdTable[id]
  },
  nonEmptyStampPaletteIds(state) {
    return Object.values(state.stampPalettes)
      .filter(palette => palette.stamps?.length > 0)
      .map(palette => palette.id)
  }
})
