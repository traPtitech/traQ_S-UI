import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import PortalVue from 'portal-vue'

Vue.use(VueCompositionApi)
Vue.use(PortalVue)

Vue.config.productionTip = false

new Vue({
  router,
  store: store.original,
  render: h => h(App)
}).$mount('#app')
