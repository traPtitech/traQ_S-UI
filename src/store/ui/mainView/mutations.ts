import { defineMutations } from 'direct-vuex'
import { S, LayoutType, ViewInformation, MainViewComponentState } from './state'

export const mutations = defineMutations<S>()({
  setLayout(state: S, layout: LayoutType) {
    state.layout = layout
  },
  setMainViewComponentState(state: S, componentState: MainViewComponentState) {
    state.currentMainViewComponentState = componentState
  },
  setPrimaryView(state: S, view: ViewInformation) {
    state.primaryView = view
  },
  setSecondaryView(state: S, view: ViewInformation) {
    state.primaryView = view
  },
  setLastScrollPosition(state: S, position: number) {
    state.lastScrollPosition = position
  }
})
