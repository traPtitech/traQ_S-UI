import { defineMutations } from 'direct-vuex'
import { S, LayoutType, ViewInformation, MainViewComponentState } from './state'

export const mutations = defineMutations<S>()({
  setLayout(state, layout: LayoutType) {
    state.layout = layout
  },
  setMainViewComponentState(state, componentState: MainViewComponentState) {
    state.currentMainViewComponentState = componentState
  },
  setPrimaryView(state, view: ViewInformation) {
    state.primaryView = view
  },
  setSecondaryView(state, view: ViewInformation) {
    state.secondaryView = view
  },
  unsetSecondaryView(state) {
    state.secondaryView = undefined
  }
})
