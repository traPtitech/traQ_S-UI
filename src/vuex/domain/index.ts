import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners } from './listeners'

/**
 * entitiesでないサーバーの情報を扱うstore
 *
 * listenersでwebsocketを受け取ったり、entitiesの変更を受け取ったりする
 */
export const domain = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineWsListeners(store => store.domain)
