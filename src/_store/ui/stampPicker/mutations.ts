import { defineMutations } from 'direct-vuex'
import { S, StampSelectHandler, SelectedStampData, PositionOf } from './state'
import { StampSet } from '@/components/Main/StampPicker/use/stampSetSelector'
import { Place } from '.'

export const mutations = defineMutations<S>()({
  setSelectHandler(state, handler: StampSelectHandler) {
    state.selectHandler = handler
  },
  setCurrentStampSet(state, set: StampSet) {
    state.currentStampSet = set
  },
  setPosition(state, position: Place) {
    state.position = position
  },
  setPositionOf(state, positionOf: PositionOf) {
    state.positionOf = positionOf
  },
  clearSelectHandler(state) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    state.selectHandler = (_: SelectedStampData) => {}
  },
  clearCurrentStampPaletteId(state) {
    state.currentStampSet = {
      type: 'history',
      id: ''
    }
  },
  clearPosition(state) {
    state.position = undefined
  }
})
