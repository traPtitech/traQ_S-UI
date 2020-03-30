import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/store'
import { S } from './state'
import { stampPicker } from './index'
import { StampId } from '@/types/entity-ids'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, stampPicker)

export const getters = defineGetters<S>()({
  shouldShowStampPicker(state) {
    return state.targetPortalName.length > 0
  },
  stampIds(...args): StampId[] {
    const { state, rootState } = getterContext(args)
    if (state.currentStampSet.type === 'history') {
      return []
    }
    if (state.currentStampSet.type === 'palette') {
      const id = state.currentStampSet.id
      const stampPalette = rootState.entities.stampPalettes[id]
      return stampPalette?.stamps ?? []
    }
    if (state.currentStampSet.type === 'category') {
      const traQStampCategory = rootState.domain.stampCategory.traQStampCategory
      const unicodeStampCategories =
        rootState.domain.stampCategory.unicodeStampCategories
      const name = state.currentStampSet.id
      if (name === traQStampCategory.name) {
        return traQStampCategory.stampIds
      }
      return (
        unicodeStampCategories.find(
          category => name === `unicode-${category.name}`
        )?.stampIds ?? []
      )
    }
    // TODO: historyを返す
    return []
  }
})
