import { createApp } from 'vue'

import App from './App.vue'
import boolAttr from './bool-attr'
import { initializeMeta } from './lib/apis'
import { setupNotificationNavigation } from './lib/notification/navigation'
import { deleteStampCacheIDB } from './lib/stampCache'
import { setupGlobalFuncs } from './markdown-bridge'
import router from './router'
import store from './store'
import './styles/global.scss'

import('katex/dist/katex.css')

setupNotificationNavigation()

const bootstrap = async () => {
  await initializeMeta()

  setupGlobalFuncs()

  const app = createApp(App)
  app.use(router)
  app.use(store)

  app.use(boolAttr)

  app.mount('#app')

  if (import.meta.env.MODE === 'development') {
    app.config.performance = true
  }

  deleteStampCacheIDB()
}

bootstrap()
