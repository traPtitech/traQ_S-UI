import firebase from 'firebase/app'
import 'firebase/messaging'
import {
  ExtendedNotificationOptions,
  NotificationClickEvent
} from '@/types/InlineNotificationReplies'
import apis from './apis'
import router from '@/router'
import { NativeAppWindow } from '@/types/NativeAppBridge'
import { isIOSApp } from './util/browser'

declare const window: NativeAppWindow

export const setupFirebase = () => {
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
    firebase.initializeApp(config)
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
