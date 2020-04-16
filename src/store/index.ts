import Vue from 'vue'
import Vuex from 'vuex'
import { createDirectStore } from 'direct-vuex'
import VuexPersistence from 'vuex-persist'
import indexedDBStorage from './indexedDBStorage'
import { persistReducer } from './defineDBModule'
import { entities } from './entities'
import { domain } from './domain'
import { app } from './app'
import { ui } from './ui'

Vue.use(Vuex)

const vuexStrict = process.env.NODE_ENV !== 'production'

const persisted = new VuexPersistence({
  strictMode: vuexStrict,
  storage: indexedDBStorage,
  asyncStorage: true,
  reducer: persistReducer
})

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  // vuex-persist setting for strict mode
  mutations: vuexStrict
    ? {
        RESTORE_MUTATION: persisted.RESTORE_MUTATION
      }
    : {},
  modules: {
    entities,
    domain,
    app,
    ui
  },
  plugins: [persisted.plugin],
  strict: vuexStrict
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
