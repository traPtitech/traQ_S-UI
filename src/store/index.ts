import { createDirectStore } from 'direct-vuex'
import { entities } from './entities'
import { domain } from './domain'
import { app } from './app'
import { ui } from './ui'

const vuexStrict = process.env.NODE_ENV !== 'production'

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    entities,
    domain,
    app,
    ui
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
