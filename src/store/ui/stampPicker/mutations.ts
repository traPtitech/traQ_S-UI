import { defineMutations } from 'direct-vuex'
import { S, StampSelectHandler, SelectedStampData } from './state'
import { StampSet } from '@/components/Main/StampPicker/use/stampSetSelector'

export const mutations = defineMutations<S>()({
  setTargetPortalName(state, name: string) {
    state.targetPortalName = name
  },
  setSelectHandler(state, handler: StampSelectHandler) {
    state.selectHandler = handler
  },
  setCurrentStampSet(state, set: StampSet) {
    state.currentStampSet = set
  },
  clearSelectHandler(state) {
    state.selectHandler = (_: SelectedStampData) => {}
  },
  clearTargetPortalName(state) {
    state.targetPortalName = ''
  },
  clearCurrentStampPaletteId(state) {
    state.currentStampSet = {
      type: 'history',
      id: ''
    }
  },
  setPosition(state, position: { x: number; y: number }) {
    state.position = position
  },
  initPosition(state) {
    state.position = { x: 0, y: 0 }
  }
})
