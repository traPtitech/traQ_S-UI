import { createModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const root = createModule({
  state,
  getters,
  mutations,
  actions
})
