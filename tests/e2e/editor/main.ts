import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { createPinia } from 'pinia'

import boolAttr from '/@/bool-attr'
import { initializeMeta } from '/@/lib/apis'
import '/@/styles/global.scss'
import '/@/styles/markdown-assets.scss'

import App from './App.vue'

await initializeMeta()

// Start with current settings so editor tests do not race legacy DB migrations.
localStorage.setItem(
  'traQ_S-store/app/browserSettings',
  JSON.stringify({
    version: 2,
    data: {
      sendWithModifierKey: 'modifier',
      modifierKey: { ctrl: true, alt: false, shift: false, macCtrl: false }
    }
  })
)

createApp(App)
  .use(createPinia())
  .use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }]
    })
  )
  .use(boolAttr)
  .mount('#app')
