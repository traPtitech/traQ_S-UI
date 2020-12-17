import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { entities, StampMap } from '.'
import { moduleGetterContext } from '@/_store'
import { Stamp } from '@traptitech/traq'

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
  nonEmptyStampPaletteIds(state) {
    return Object.values(state.stampPalettes)
      .filter(palette => palette.stamps?.length > 0)
      .map(palette => palette.id)
  }
})
