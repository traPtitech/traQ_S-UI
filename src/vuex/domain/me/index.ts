import { defineDBModule } from '/@/vuex/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners, defineMessageListeners } from './listeners'
import mitt from 'mitt'

export const me = defineDBModule({
  path: ['domain.me.detail'],
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineWsListeners(store => store.domain.me)
defineMessageListeners(store => store.domain.me)

type MeEventMap = {
  setSubscriptions: void
  updateSubscriptions: void
}

export const meMitt = mitt<MeEventMap>()
