import { defineGetters } from 'direct-vuex'
import { S, MainViewComponentState } from './state'

export type HeaderStyle = 'default' | 'dark'

export const getters = defineGetters<S>()({
  isSidebarOpen(state: S) {
    return (
      state.currentMainViewComponentState ===
      MainViewComponentState.SidebarShown
    )
  },
  isNavOpen(state: S) {
    return (
      state.currentMainViewComponentState === MainViewComponentState.NavShown
    )
  },
  isNoComponentOpen(state: S) {
    return state.currentMainViewComponentState === MainViewComponentState.Hidden
  },
  headerStyle(state: S): HeaderStyle {
    if (
      state.layout === 'split-reverse' &&
      state.secondaryView?.type === 'qall'
    ) {
      return 'dark'
    }
    return 'default'
  }
})
