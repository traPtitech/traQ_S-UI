import { createApp, defineAsyncComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { createPinia } from 'pinia'

import boolAttr from '/@/bool-attr'
import { initializeMeta } from '/@/lib/apis'
import '/@/styles/global.scss'

await initializeMeta()

localStorage.setItem(
  'traQ_S-store/app/browserSettings',
  JSON.stringify({ version: 2, data: {} })
)

// チャンネル名の依存先で Qall のストアが初期化されるため、
// 実際の起動順に合わせて Pinia とルーターを先に登録する。
createApp(defineAsyncComponent(() => import('./App.vue')))
  .use(createPinia())
  .use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }]
    })
  )
  .use(boolAttr)
  .mount('#app')
