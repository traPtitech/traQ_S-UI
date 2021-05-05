import {
  ExtendedNotificationOptions,
  NotificationClickEvent
} from '@/types/InlineNotificationReplies'
import apis from './apis'
import router from '@/router'
import { isIOSApp } from './util/browser'
import { ChannelId, DMChannelId } from '@/types/entity-ids'

const loadFirebase = async () => {
  const firebase = (await import('firebase/app')).default
  await import('firebase/messaging')
  return firebase
}

const setupFirebase = async () => {
  if (window.traQConfig.firebase === undefined) {
    return
  }

  const fb = await loadFirebase()
  try {
    fb.initializeApp(window.traQConfig.firebase)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] failed to initialize', e)
  }
  return fb
}

// TODO: いい感じにする
const ignoredChannels = ['#general', '#random']

const notify = async (
  title: string,
  options: ExtendedNotificationOptions = {}
) => {
  if (title.startsWith('#') && !ignoredChannels.includes(title)) {
    const verb = title.includes('#') ? '投稿' : '返信'
    options.actions = [
      {
        action: 'reply',
        type: 'text',
        title: '返信',
        placeholder: `${title}へ${verb}する...`
      }
    ]
  }
  if (options.tag) {
    options.renotify = true
  }
  options.badge = '/img/icons/badge.png'

  if (navigator.serviceWorker) {
    const regist = await navigator.serviceWorker.ready
    options.data = options
    return regist.showNotification(title, options)
  }
  if (Notification?.permission === 'granted') {
    return new Notification(title, options)
  }
  return null
}

interface NotificationPayloadData extends ExtendedNotificationOptions {
  title?: string
  path?: string
  data: NotificationPayloadData
}
interface NotificationPayload {
  data: NotificationPayloadData
  from: number
  priority: string
}

/**
 * アップデートできるときに実行される関数
 * アップデートを実行するときにrunUpdateを呼び出す
 */
type OnCanUpdate = (runUpdate: () => void) => void

const setupUpdateToast = (
  registration: ServiceWorkerRegistration,
  onCanUpdate: OnCanUpdate
) => {
  // 新しいsw
  if (!navigator.serviceWorker.controller) return

  const doCanUpdate = () => {
    onCanUpdate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
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
  const newWorker = registration.installing
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state !== 'installed') return
      doCanUpdate()
    })
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
}

export const connectFirebase = async (onCanUpdate: OnCanUpdate) => {
  if (isIOSApp(window)) {
    // iOSはNotificationがないため、先にFCMトークンを登録する
    const token = window.iOSToken
    if (token && token !== 'No Token') {
      apis.registerFCMDevice({ token })
    }
  }

  if (Notification?.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      notify('ようこそtraQへ！！')
    }
  }

  const firebase = await setupFirebase()

  if (process.env.NODE_ENV !== 'production' || !navigator?.serviceWorker) {
    return
  }

  navigator.serviceWorker.addEventListener('message', data => {
    if (data.data.type === 'navigate') {
      // 同じ場所に移動しようとした際のエラーを消す
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      router.push(data.data.to).catch(() => {})
    }
  })

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  })

  setupUpdateToast(registration, onCanUpdate)

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    // eslint-disable-next-line no-console
    console.warn(`[Notification] permission ${permission}`)
    return
  }

  if (!firebase) {
    return
  }
  const messaging = firebase.messaging()

  messaging.onMessage(async (payload: Readonly<NotificationPayload>) => {
    const notification = await notify(
      payload.data.title || 'traQ',
      payload.data
    )
    if (!notification) return

    notification.onclick = (event: NotificationClickEvent) => {
      if (event.reply) {
        const channelID = payload.data.tag?.slice('c:'.length)
        if (channelID) {
          apis.postMessage(channelID, {
            content: event.reply,
            embed: true
          })
        } else {
          // eslint-disable-next-line no-console
          console.error('[Notification] reply channel id was missing')
        }
        return
      }
      window.focus()

      if (payload.data.path) {
        // 同じ場所に移動しようとした際のエラーを消す
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        router.push(payload.data.path).catch(() => {})
      }
    }
  })

  const token = await messaging.getToken({
    serviceWorkerRegistration: registration
  })
  apis.registerFCMDevice({ token })
}

export const deleteToken = async () => {
  if (Notification.permission !== 'granted') return

  const firebase = await loadFirebase()
  const messaging = firebase.messaging()
  messaging.deleteToken()
}

export const removeNotification = async (
  channelId: ChannelId | DMChannelId
) => {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return
  const notifications = await registration.getNotifications({
    tag: `c:${channelId}`
  })
  notifications?.forEach(notification => notification.close())
}
