import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export type SubscriptionLevel = 'notified' | 'subscribed' | 'none'

export const me = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
