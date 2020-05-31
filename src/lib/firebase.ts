import type firebase from 'firebase/app'
import {
  ExtendedNotificationOptions,
  NotificationClickEvent
} from '@/types/InlineNotificationReplies'
import apis from './apis'
import router from '@/router'
import { NativeAppWindow } from '@/types/NativeAppBridge'
import { isIOSApp } from './util/browser'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import store from '@/store'

declare const window: NativeAppWindow

const loadFirebase = async () => {
  const firebase = (await import('firebase/app')).default
  await import('firebase/messaging')
  return firebase
}

const setupFirebase = (fb: typeof firebase) => {
  try {
    const config = {
      apiKey: 'AIzaSyDee_VkrRtByJCrCZAX3nTSDPl8AaHlWfY',
      authDomain: 'traq-r.firebaseapp.com',
      databaseURL: 'https://traq-r.firebaseio.com',
      projectId: 'traq-r',
      storageBucket: 'traq-r.appspot.com',
      messagingSenderId: '993645413001',
      appId: '1:993645413001:web:b253ea3776d6cf85163c58'
    }
    fb.initializeApp(config)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] failed to initialize', e)
  }
}

// TODO: いい感じにする
const ignoredChannels = ['#general', '#random']

const notify = async (
  title: string,
  options: ExtendedNotificationOptions = {}
) => {
  if (title && !ignoredChannels.includes(title)) {
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

const showUpdateToast = () => {
  store.commit.ui.toast.addToast({
    type: 'success',
    text: 'クリックでアップデートできます',
    timeout: 10000,
    onClick: async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    }
  })
}

const setupUpdateToast = (registration: ServiceWorkerRegistration) => {
  // 新しいsw
  if (!navigator.serviceWorker.controller) return

  // swが更新完了したときにリロード
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  // ほかのタブでswが更新されたとき
  if (registration.waiting) {
    showUpdateToast()
    return
  }

  // swが更新できるときにトースト表示
  const newWorker = registration.installing
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state !== 'installed') return
      showUpdateToast()
    })
    return
  }

  // swが更新できるときにトースト表示
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing
    newWorker?.addEventListener('statechange', () => {
      if (newWorker.state !== 'installed') return
      showUpdateToast()
    })
  })
}

export const connectFirebase = async () => {
  if (isIOSApp()) {
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

  const firebase = await loadFirebase()
  setupFirebase(firebase)

  if (process.env.NODE_ENV === 'production' && navigator?.serviceWorker) {
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
    registration.update()

    setupUpdateToast(registration)

    const messaging = firebase.messaging()
    messaging.useServiceWorker(registration)
    messaging.onTokenRefresh(async () => {
      const token = await messaging.getToken()
      apis.registerFCMDevice({ token })
    })

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      // eslint-disable-next-line no-console
      console.warn(`[Notification] permission ${permission}`)
      return
    }

    messaging.onMessage(async (payload: NotificationPayload) => {
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

    const token = await messaging.getToken()
    apis.registerFCMDevice({ token })
  }
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
