import { createModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { messages } from './messages'
import { rtc } from '../app/rtc'

export const app = createModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    messages,
    rtc
  }
})
