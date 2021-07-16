import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import boolAttr from './bool-attr'
import vClickOutside from 'v-click-outside'
import { setupGlobalFuncs } from './markdown-bridge'
import { mountMitt } from '@/onMount'

import('./katexCss')

!(async () => {
  // iOS14.6でIndexedDBが使えないタイミングがある問題へのworkaround
  window.indexedDB

  setupGlobalFuncs()

  const app = createApp(App)
  app.use(router)
  app.use(store.original)

  app.use(boolAttr)
  app.use(vClickOutside)

  app.mount('#app')

  if (import.meta.env.MODE === 'development') {
    app.config.performance = true
  }

  mountMitt.emit('mount')
})()
