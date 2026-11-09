import type { FirebaseApp } from 'firebase/app'
import {
  deleteToken as deleteTokenFb,
  getMessaging,
  getToken as getTokenFb,
  isSupported,
  onMessage
} from 'firebase/messaging'

import apis from '/@/lib/apis'
import { wait } from '/@/lib/basic/timer'
import { isIOSApp, isWebKit } from '/@/lib/dom/browser'
import router from '/@/router'
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
  if (window.Notification?.permission === 'granted') {
    return new window.Notification(notificationTitle, notificationOptions)
  }
  return null
}

const setupServiceWorker = async (onCanUpdate: OnCanUpdate) => {
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  })

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

  setupUpdateToast(registration, onCanUpdate)

  return registration
}

let serviceWorkerRegistration:
  | Promise<ServiceWorkerRegistration | undefined>
  | undefined
let pushConnection: Promise<void> | undefined
let stopListeningForPush: (() => void) | undefined

const registerPush = async (
  registration: Promise<ServiceWorkerRegistration | undefined>,
  firebaseApp: FirebaseApp
) => {
  const serviceWorker = await registration
  if (!serviceWorker || !(await isSupported())) return

  const messaging = getMessaging(firebaseApp)
  const token = await Promise.race([
    getTokenFb(messaging, {
      vapidKey,
      serviceWorkerRegistration: serviceWorker
    }),
    wait(5000)
  ])

  if (!token) {
    throw new Error('getToken timed out')
  }

  await apis.registerFCMDevice({ token })

  stopListeningForPush = onMessage(messaging, async payload => {
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
}

const connectPush = () => {
  const firebaseApp = getFirebaseApp()
  if (
    window.Notification?.permission !== 'granted' ||
    !serviceWorkerRegistration ||
    !firebaseApp
  ) {
    return
  }

  pushConnection ??= registerPush(serviceWorkerRegistration, firebaseApp).catch(
    error => {
      pushConnection = undefined
      // eslint-disable-next-line no-console
      console.warn('[Notification] failed to register push', error)
    }
  )

  return pushConnection
}

export const requestNotificationPermission = async () => {
  const permission = await window.Notification?.requestPermission()
  if (permission === 'granted') connectPush()

  return permission
}

export const connectFirebase = async (onCanUpdate: OnCanUpdate) => {
  if (isIOSApp(window)) {
    // iOSのネイティブアプリから渡されたFCMトークンを登録する
    const token = window.iOSToken
    if (token && token !== 'No Token') {
      apis.registerFCMDevice({ token })
    }
  }

  setupFirebaseApp()

  if (!import.meta.env.DEV && navigator.serviceWorker) {
    serviceWorkerRegistration ??= setupServiceWorker(onCanUpdate).catch(error => {
      serviceWorkerRegistration = undefined
      // eslint-disable-next-line no-console
      console.warn('[Notification] failed to register service worker', error)
      return undefined
    })
    await serviceWorkerRegistration
  }

  // WebKit では設定画面のユーザージェスチャーを起点に許可を求める。
  if (!isWebKit() && window.Notification?.permission === 'default') {
    const permission = await requestNotificationPermission()
    if (permission === 'granted' && serviceWorkerRegistration) {
      notify({ title: `ようこそ${appName}へ！！` }, true)
    }

    return
  }

  await connectPush()
}

export const deleteToken = async () => {
  if (window.Notification?.permission !== 'granted') return

  const firebaseApp = getFirebaseApp()
  if (!firebaseApp || !pushConnection) return

  await pushConnection
  if (!(await isSupported())) return

  stopListeningForPush?.()
  stopListeningForPush = undefined
  pushConnection = undefined
  await deleteTokenFb(getMessaging(firebaseApp))
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
  notifications?.forEach(notification => notification.close())
}
