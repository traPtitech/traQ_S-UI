import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import { root } from './root'
import { entities } from './entities'
import { domain } from './domain'
import { app } from './app'
import { ui } from './ui'

Vue.use(Vuex)

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  ...root,
  modules: {
    entities,
    domain,
    app,
    ui
  },
  strict: process.env.NODE_ENV !== 'production'
})

export default store
export {
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
}
export type AppStore = typeof store
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore
  }
}
