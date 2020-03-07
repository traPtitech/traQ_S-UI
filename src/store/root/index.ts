import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const root = defineModule({
  state,
  getters,
  mutations,
  actions
})
