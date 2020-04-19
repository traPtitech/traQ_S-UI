import { defineGetters } from 'direct-vuex'
import { S, MainViewComponentState } from './state'

export const getters = defineGetters<S>()({
  isSidebarOpen(state: S) {
    return (
      state.currentMainViewComponentState ===
      MainViewComponentState.SidebarShown
    )
  }
})
