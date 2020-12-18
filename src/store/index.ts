import { createDirectStore } from 'direct-vuex'
import { entities } from './entities'

const vuexStrict = process.env.NODE_ENV !== 'production'

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    entities
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
