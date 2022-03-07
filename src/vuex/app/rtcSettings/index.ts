import { defineDBModule } from '/@/vuex/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const rtcSettings = defineDBModule({
  path: 'app.rtcSettings',
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
