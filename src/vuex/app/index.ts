import { defineDBModule } from '../defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { rtc } from './rtc'
import { themeSettings } from './themeSettings'

/**
 * サーバーからの状態の変更を受け取らないstore (送ることはあるがここから直接送信することはない)
 */
export const app = defineDBModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  path: ['app.messageSearchHistories'],
  modules: {
    rtc,
    themeSettings
  }
})
