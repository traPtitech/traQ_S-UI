import { createDirectStore } from 'direct-vuex'
import VuexPersistence from 'vuex-persist'
import indexedDBStorage from './indexedDBStorage'
import { persistReducer } from './defineDBModule'
import { entities } from './entities'
import { domain } from './domain'
import { app } from './app'
import { ui } from './ui'

const vuexStrict = import.meta.env.MODE !== 'production'

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

type OriginalStore = typeof store.original & {
  readonly restored: Promise<void>
}

export const originalStore = store.original as OriginalStore
