import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners, defineMessageListeners } from './listeners'

export const messagesView = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineWsListeners(store => store.domain.messagesView)
defineMessageListeners(store => store.domain.messagesView)
