import type { OnCanUpdate } from '/@/lib/notification/updateToast'
import { setupUpdateToast } from '/@/lib/notification/updateToast'

const APP_SERVICE_WORKER_SCOPE = '/'

export const registerAppServiceWorker = async (onCanUpdate: OnCanUpdate) => {
  if (import.meta.env.DEV || !navigator?.serviceWorker) {
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: APP_SERVICE_WORKER_SCOPE
  })

  setupUpdateToast(registration, onCanUpdate)
}
