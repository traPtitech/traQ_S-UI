import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { messages } from './messages'
import { rtc } from './rtc'
import { browserSettings } from './browserSettings'

export const app = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    messages,
    rtc,
    browserSettings
  }
})
