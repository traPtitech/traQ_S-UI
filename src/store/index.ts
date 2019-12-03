import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import { state } from './root/state'
import { getters } from './root/getters'
import { mutations } from './root/mutations'
import { actions } from './root/actions'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  state,
  getters,
  mutations,
  actions
} as const)

export default store
export { rootActionContext, moduleActionContext }
export type AppStore = typeof store
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore
  }
}
