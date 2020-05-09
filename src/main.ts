import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import App from './App.vue'
import router from './router'
import store from './store'
import PortalVue from 'portal-vue'
import vClickOutside from 'v-click-outside'
import VueTextareaAutosize from 'vue-textarea-autosize'
import { setupGlobalFuncs } from './markdown-bridge'
import { setupFirebase } from './lib/firebase'
import { loadResizeObserver } from './resizeObserver'

!(async () => {
  setupGlobalFuncs()
  setupFirebase()

  await loadResizeObserver()

  Vue.use(VueCompositionApi)
  Vue.use(PortalVue)
  Vue.use(vClickOutside)
  Vue.use(VueTextareaAutosize)

  if (process.env.NODE_ENV === 'development') {
    Vue.config.productionTip = false
    Vue.config.performance = true
  }

  new Vue({
    router,
    store: store.original,
    render: h => h(App)
  }).$mount('#app')
})()
