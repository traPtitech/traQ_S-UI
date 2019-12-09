import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import { root } from './root'
import { module1 } from './module1'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  ...root,
  modules: {
    module1
  }
})

export default store
export { rootActionContext, moduleActionContext }
export type AppStore = typeof store
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore
  }
}
