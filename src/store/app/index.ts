import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { browserSettings } from './browserSettings'
import { rtc } from './rtc'
import { rtcSettings } from './rtcSettings'
import { themeSettings } from './themeSettings'

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
    browserSettings,
    rtcSettings,
    rtc,
    themeSettings
  }
})
