import { defineGetters } from 'direct-vuex'
import { S, MainViewComponentState } from './state'

export type HeaderStyle = 'default' | 'dark'

export const getters = defineGetters<S>()({
  isSidebarOpen(state) {
    return (
      state.currentMainViewComponentState ===
      MainViewComponentState.SidebarShown
    )
  },
  isNavOpen(state) {
    return (
      state.currentMainViewComponentState === MainViewComponentState.NavShown
    )
  },
  isNoComponentOpen(state) {
    return state.currentMainViewComponentState === MainViewComponentState.Hidden
  },
  headerStyle(state): HeaderStyle {
    if (
      state.layout === 'split-reverse' &&
      state.secondaryView?.type === 'qall'
    ) {
      return 'dark'
    }
    return 'default'
  }
})
