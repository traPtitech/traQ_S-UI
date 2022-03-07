import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineEntityListeners } from './listeners'

export const stampCategory = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineEntityListeners(store => store.domain.stampCategory)
