import router from '/@/router'

export type ServiceWorkerNavigateMessage = {
  type: 'navigate'
  to: string
}

export const setupNotificationNavigation = () => {
  if (import.meta.env.DEV || !navigator.serviceWorker) return

  navigator.serviceWorker.addEventListener(
    'message',
    ({ data }: MessageEvent<ServiceWorkerNavigateMessage>) => {
      if (data?.type !== 'navigate' || typeof data.to !== 'string') return

      router
        .isReady()
        .then(() => router.push(data.to))
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {})
    }
  )
}
