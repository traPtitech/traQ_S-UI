import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { listeners } from './listeners'

export const messages = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
listeners()
