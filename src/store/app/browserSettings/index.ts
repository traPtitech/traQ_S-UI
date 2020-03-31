import { defineDBModule } from '@/store/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export type SendKey = 'alt' | 'ctrl' | 'shift'

export const browserSettings = defineDBModule({
  path: 'app.browserSettings',
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
