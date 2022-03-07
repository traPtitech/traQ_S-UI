import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

/**
 * 接続中のQallの情報を持つストア
 * 接続していないものも含むQallの情報はdomain/rtc
 */
export const rtc = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
