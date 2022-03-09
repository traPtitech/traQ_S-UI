import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuex from './vuex'
import store from './store'
import boolAttr from './bool-attr'
import { setupGlobalFuncs } from './markdown-bridge'
import { mountMitt } from '/@/onMount'

import('./katexCss')

setupGlobalFuncs()

const app = createApp(App)
app.use(router)
app.use(store)
app.use(vuex.original)

app.use(boolAttr)

app.mount('#app')

if (import.meta.env.MODE === 'development') {
  app.config.performance = true
}

mountMitt.emit('mount')
