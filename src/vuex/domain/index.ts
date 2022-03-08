import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners } from './listeners'
import { me } from './me'
import { messagesView } from './messagesView'
import { stampCategory } from './stampCategory'

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
  actions,
  modules: {
    me,
    messagesView,
    stampCategory
  }
})
defineWsListeners(store => store.domain)
