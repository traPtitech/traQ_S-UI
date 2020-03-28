import { defineMutations } from 'direct-vuex'
import { S, StampSelectHandler, SelectedStampData } from './state'

export const mutations = defineMutations<S>()({
  setTargetPortalName(state, name: string) {
    state.targetPortalName = name
  },
  clearTargetPortalName(state) {
    state.targetPortalName = ''
  },
  setSelectHandler(state, handler: StampSelectHandler) {
    state.selectHandler = handler
  },
  clearSelectHandler(state) {
    state.selectHandler = (_: SelectedStampData) => {}
  }
})
