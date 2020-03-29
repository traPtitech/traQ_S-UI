import { defineMutations } from 'direct-vuex'
import { S, StampSelectHandler, SelectedStampData } from './state'

export const mutations = defineMutations<S>()({
  setTargetPortalName(state, name: string) {
    state.targetPortalName = name
  },
  setSelectHandler(state, handler: StampSelectHandler) {
    state.selectHandler = handler
  },
  setCurrentStampPaletteId(state, id: string) {
    state.currentStampPaletteId = id
  },
  setCurrentStampCategoryName(state, name: string) {
    state.currentStampCategoryName = name
  },
  clearSelectHandler(state) {
    state.selectHandler = (_: SelectedStampData) => {}
  },
  clearTargetPortalName(state) {
    state.targetPortalName = ''
  },
  clearCurrentStampPaletteId(state) {
    state.currentStampPaletteId = undefined
  },
  clearCurrentStampCategoryName(state) {
    state.currentStampCategoryName = undefined
  }
})
