import { createApp } from 'vue'

import App from './App.vue'
import boolAttr from './bool-attr'
import { initializeMeta } from './lib/apis'
import { setupNotificationNavigation } from './lib/notification/navigation'
import { deleteStampCacheIDB } from './lib/stampCache'
import { telemetry } from './lib/telemetry'
import { setupGlobalFuncs } from './markdown-bridge'
import router from './router'
import store from './store'
import { useToastStore } from './store/ui/toast'
import './styles/global.scss'

telemetry.startErrorCollection()

let preloadErrorToastId: number | undefined

window.addEventListener('vite:preloadError', () => {
  const { addToast } = useToastStore(store)

  preloadErrorToastId = addToast(
    {
      type: 'error',
      text: '画面の読み込みに失敗しました。選択して再読み込みできます。',
      timeout: 10000,
      onClick: () => window.location.reload()
    },
    preloadErrorToastId
  )
})

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
