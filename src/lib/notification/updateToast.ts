/**
 * アップデートできるときに実行される関数
 * アップデートを実行するときにrunUpdateを呼び出す
 */
export type OnCanUpdate = (runUpdate: () => void) => void

export const setupUpdateToast = (
  registration: ServiceWorkerRegistration,
  onCanUpdate: OnCanUpdate
) => {
  // 新しいsw
  if (!navigator.serviceWorker.controller) return

  const doCanUpdate = () => {
    onCanUpdate(async () => {
      const registration = await navigator.serviceWorker?.getRegistration()
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    })
  }

  // swが更新完了したときにリロード
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  // ほかのタブでswが更新されたとき
  if (registration.waiting) {
    doCanUpdate()
    return
  }

  // swが更新できるときにトースト表示
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing
    newWorker?.addEventListener('statechange', () => {
      if (newWorker.state !== 'installed') return
      doCanUpdate()
    })
  })

  // 1時間毎にアップデートをチェックする
  setInterval(
    () => {
      registration.update()
    },
    1000 * 60 * 60
  )
}
