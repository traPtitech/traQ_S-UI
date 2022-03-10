import { createDirectStore } from 'direct-vuex'

const vuexStrict = import.meta.env.MODE !== 'production'

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
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
