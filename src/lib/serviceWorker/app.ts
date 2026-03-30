import { isSafari } from '/@/lib/dom/browser'
import type { OnCanUpdate } from '/@/lib/notification/updateToast'
import { setupUpdateToast } from '/@/lib/notification/updateToast'

const APP_SERVICE_WORKER_SCOPE = '/'

const getAppServiceWorkerRegistration = async () =>
  navigator.serviceWorker?.getRegistration(APP_SERVICE_WORKER_SCOPE)

// Safari は root scope の service worker 配下だと API の再検証経路が変わり、
// ETag による 304 が効かなくなるため page-controlling worker を無効化する。
const shouldDisableAppServiceWorker = () => isSafari()

const unregisterAppServiceWorker = async () => {
  const registration = await getAppServiceWorkerRegistration()
  if (!registration) return false

  await registration.unregister()
  return true
}

export const registerAppServiceWorker = async (onCanUpdate: OnCanUpdate) => {
  if (import.meta.env.DEV || !navigator?.serviceWorker) {
    return
  }

  if (shouldDisableAppServiceWorker()) {
    const unregistered = await unregisterAppServiceWorker()
    if (unregistered && navigator.serviceWorker.controller) {
      window.location.reload()
    }
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: APP_SERVICE_WORKER_SCOPE
  })

  setupUpdateToast(registration, onCanUpdate)
}
