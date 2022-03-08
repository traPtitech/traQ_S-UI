import { createDirectStore } from 'direct-vuex'
import { entities } from './entities'
import { domain } from './domain'

const vuexStrict = import.meta.env.MODE !== 'production'

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    entities,
    domain
  },
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
