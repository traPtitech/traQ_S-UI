import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { rtc } from './rtc'

/**
 * サーバーからの状態の変更を受け取らないstore (送ることはあるがここから直接送信することはない)
 */
export const app = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    rtc
  }
})
