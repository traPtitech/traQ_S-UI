import { defineDBModule } from '/@/vuex/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export type ThemeType = 'auto' | 'light' | 'dark' | 'custom'

export const themeSettings = defineDBModule({
  path: ['app.themeSettings.type', 'app.themeSettings.custom'],
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
