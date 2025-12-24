import {
  deleteToken as deleteTokenFb,
  getMessaging,
  getToken as getTokenFb,
  onMessage
} from 'firebase/messaging'

import apis from '/@/lib/apis'
import { wait } from '/@/lib/basic/timer'
import { isIOSApp, isPWA, isWebKit } from '/@/lib/dom/browser'
import router from '/@/router'
import { useToastStore } from '/@/store/ui/toast'
import type { NotificationClickEvent } from '/@/types/InlineNotificationReplies'
import type { ChannelId, DMChannelId } from '/@/types/entity-ids'

import type { FirebasePayloadData } from './firebase'
import { getFirebaseApp, setupFirebaseApp } from './firebase'
import { createNotificationArgumentsCreator } from './notificationArguments'
import type { OnCanUpdate } from './updateToast'
import { setupUpdateToast } from './updateToast'

const appName = window.traQConfig.name || 'traQ'
const ignoredChannels = window.traQConfig.inlineReplyDisableChannels ?? []
const vapidKey = window.traQConfig.firebase?.vapidKey

type ServiceWorkerMessage = ServiceWorkerNavigateMessage
export type ServiceWorkerNavigateMessage = {
  type: 'navigate'
  to: string
}

const createNotificationArguments = createNotificationArgumentsCreator(
  appName,
  ignoredChannels
)

const notify = async (
  options: Partial<FirebasePayloadData>,
  withoutInput = false
) => {
  const [notificationTitle, notificationOptions] = createNotificationArguments(
    options,
    withoutInput
  )

  if (navigator.serviceWorker) {
    const regist = await navigator.serviceWorker.ready
    // mac SafariだとshowNotificationが存在しない
    if (regist.showNotification) {
      return regist.showNotification(notificationTitle, notificationOptions)
    }
  }
  if (Notification?.permission === 'granted') {
    return new Notification(notificationTitle, notificationOptions)
  }
  return null
}

export const connectFirebase = async (onCanUpdate: OnCanUpdate) => {
  if (isIOSApp(window)) {
    // iOSはNotificationがないため、先にFCMトークンを登録する
    const token = window.iOSToken
    if (token && token !== 'No Token') {
      apis.registerFCMDevice({ token })
    }
  }

  if (Notification) {
    if (Notification.permission === 'default') {
      // 上で Notification が存在していることを確認している
      const permission = await (() => {
        // WebKit ではユーザージェスチャーを起点としたポップアップのみ許可される
        if (isWebKit() && isPWA()) {
          const { addToast, deleteToast } = useToastStore()

          return new Promise<NotificationPermission>((resolve, reject) => {
            addToast({
              type: 'info',
              text: '【通知を有効にしてください】\nメッセージ受信時に通知が届くようになります。(クリックで許可)',
              timeout: Infinity,
              onClick: id => {
                deleteToast(id)
                Notification.requestPermission().then(resolve).catch(reject)
              }
            })
          })
        } else {
          return Notification.requestPermission()
        }
      })()

      if (permission === 'granted') {
        notify({ title: `ようこそ${appName}へ！！` }, true)
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[Notification] permission ${permission}`)
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[Notification] Notification does not exists`)
  }

  const firebaseApp = setupFirebaseApp()

  if (import.meta.env.DEV || !navigator?.serviceWorker) {
    return
  }

  navigator.serviceWorker.addEventListener(
    'message',
    ({ data }: MessageEvent<ServiceWorkerMessage>) => {
      if (data.type === 'navigate') {
        // 同じ場所に移動しようとした際のエラーを消す
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        router.push(data.to).catch(() => {})
      }
    }
  )

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  })

  setupUpdateToast(registration, onCanUpdate)

  if (Notification?.permission !== 'granted') {
    // eslint-disable-next-line no-console
    console.warn(`[Notification] permission ${Notification?.permission}`)
    return
  }
  if (!firebaseApp) {
    return
  }
  const messaging = getMessaging(firebaseApp)

  onMessage(messaging, async payload => {
    const data = payload.data as FirebasePayloadData | undefined
    if (!data) return

    const notification = await notify(data)
    if (!notification) return

    notification.onclick = (_event: Event) => {
      const event = _event as NotificationClickEvent
      if (event.reply) {
        const channelID = data.tag?.slice('c:'.length)
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

      if (data.path) {
        // 同じ場所に移動しようとした際のエラーを消す
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        router.push(data.path).catch(() => {})
      }
    }
  })

  const token = await Promise.race([
    getTokenFb(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    }),
    wait(5000)
  ])
  if (!token) {
    // 何故かregistration.pushManager.subscribe(～)が終わらないことで、
    // getTokenFbのawaitが終わらないことがある
    // eslint-disable-next-line no-console
    console.warn('[Notification] getToken timed out')
    return
  }
  apis.registerFCMDevice({ token })
}

export const deleteToken = () => {
  if (Notification?.permission !== 'granted') return

  const firebaseApp = getFirebaseApp()
  const messaging = getMessaging(firebaseApp)
  deleteTokenFb(messaging)
}

export const removeNotification = async (
  channelId: ChannelId | DMChannelId
) => {
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration) return

  // Safari(mac/iOS)ともにgetNotificationsが存在しない
  const notifications = await registration.getNotifications?.({
    tag: `c:${channelId}`
  })
  notifications.forEach(notification => notification.close())
}
