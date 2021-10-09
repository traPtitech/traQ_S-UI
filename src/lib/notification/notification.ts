import { NotificationClickEvent } from '/@/types/InlineNotificationReplies'
import apis from '/@/lib/apis'
import router from '/@/router'
import { isIOSApp } from '/@/lib/dom/browser'
import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { createNotificationArgumentsCreator } from './notificationArguments'
import { OnCanUpdate, setupUpdateToast } from './updateToast'
import {
  setupFirebaseApp,
  FirebasePayloadData,
  getFirebaseApp
} from './firebase'
import { requestNotificationPermission } from './requestPermission'
import {
  getMessaging,
  onMessage,
  getToken as getTokenFb,
  deleteToken as deleteTokenFb
} from 'firebase/messaging'

const appName = window.traQConfig.name || 'traQ'
const ignoredChannels = window.traQConfig.inlineReplyDisableChannels ?? []

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
  if (window.Notification?.permission === 'granted') {
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

  if (window.Notification) {
    if (Notification.permission === 'default') {
      // 上でNotificationが存在していることを確認している
      const permission = await requestNotificationPermission()
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

  if (window.Notification?.permission !== 'granted' || !firebaseApp) {
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

  const token = await getTokenFb(messaging, {
    serviceWorkerRegistration: registration
  })
  apis.registerFCMDevice({ token })
}

export const deleteToken = async () => {
  if (window.Notification?.permission !== 'granted') return

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
