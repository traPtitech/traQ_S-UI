import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { messages } from './messages'
import { listeners } from './listeners'

export const entities = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    messages
  }
})
listeners()
