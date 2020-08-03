import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vClickOutside from 'v-click-outside'
import VueTextareaAutosize from 'vue-textarea-autosize'
import { setupGlobalFuncs } from './markdown-bridge'
import { loadResizeObserver } from './resizeObserver'

import('katex/dist/katex.css')

!(async () => {
  setupGlobalFuncs()

  await loadResizeObserver()

  const app = createApp(App)
  app.use(router)
  app.use(store.original)

  app.use(vClickOutside)
  app.use(VueTextareaAutosize)

  app.mount('#app')

  if (process.env.NODE_ENV === 'development') {
    app.config.performance = true
  }
})()
