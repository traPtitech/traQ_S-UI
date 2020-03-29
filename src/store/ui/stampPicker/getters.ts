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
    if (!state.currentStampPaletteId && !state.currentStampCategoryName) {
      return []
    }
    if (state.currentStampPaletteId) {
      return []
    }
    if (state.currentStampCategoryName) {
      const traQStampCategory = rootState.domain.stampCategory.traQStampCategory
      const unicodeStampCategories =
        rootState.domain.stampCategory.unicodeStampCategories
      const name = state.currentStampCategoryName
      if (name === traQStampCategory.name) {
        return traQStampCategory.stampIds
      }
      return (
        unicodeStampCategories.find(category => category.name === name)
          ?.stampIds ?? []
      )
    }
    // TODO: historyを返す
    return []
  }
})
