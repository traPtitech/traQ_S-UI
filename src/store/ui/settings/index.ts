import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const settings = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
