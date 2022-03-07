import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { messages } from './messages'
import { defineWsListeners } from './listeners'

/**
 * サーバーの情報を扱う (key-value のもののみ)
 * WebSocketで状態が同期される
 * ほかのストアには依存しないようにする
 */
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
defineWsListeners(store => store.entities)
