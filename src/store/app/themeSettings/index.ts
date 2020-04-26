import { defineDBModule } from '@/store/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export type ThemeType = 'light' | 'dark' | 'custom'

export const themeSettings = defineDBModule({
  path: 'app.themeSettings',
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
