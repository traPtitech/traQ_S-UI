import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/store'
import { S } from './state'
import { stampPicker } from './index'
import { Stamp } from '@traptitech/traq'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, stampPicker)

export const getters = defineGetters<S>()({
  shouldShowStampPicker(state) {
    return state.targetPortalName.length > 0
  },
  stamps(...args): Stamp[] {
    const { state, rootState } = getterContext(args)
    if (!state.currentStampPaletteId) {
      // TODO: やる
      return Object.values(rootState.entities.stamps)
    }
    return []
  }
})
