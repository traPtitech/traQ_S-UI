import { NotificationClickEvent } from '/@/types/InlineNotificationReplies'
import apis from '/@/lib/apis'
import router from '/@/router'
import { isIOSApp } from '/@/lib/util/browser'
import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { createNotificationArgumentsCreator } from './notificationArguments'
import { OnCanUpdate, setupUpdateToast } from './updateToast'
import { setupFirebase, loadFirebase, FirebasePayloadData } from './firebase'
import { requestNotificationPermission } from './requestPermission'

const appName = window.traQConfig.name || 'traQ'
const ignoredChannels = window.traQConfig.inlineReplyDisableChannels ?? []

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
    notificationOptions.data = notificationOptions
    return regist.showNotification(notificationTitle, notificationOptions)
  }
  if (Notification?.permission === 'granted') {
    return new Notification(notificationTitle, notificationOptions)
  }
  return null
}

interface NotificationPayload {
  data: FirebasePayloadData
  from: number
  priority: string
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
      // 上でNotificationが存在していることを確認している
      const permission = await requestNotificationPermission()
      if (permission === 'granted') {
        notify({ title: `ようこそ${appName}へ！！` })
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[Notification] permission ${permission}`)
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[Notification] Notification does not exists`)
  }

  const firebase = await setupFirebase()

  if (import.meta.env.DEV || !navigator?.serviceWorker) {
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

  if (Notification?.permission !== 'granted' || !firebase) {
    return
  }
  const messaging = firebase.messaging()

  messaging.onMessage(async (payload: Readonly<NotificationPayload>) => {
    const notification = await notify(payload.data)
    if (!notification) return

    notification.onclick = (_event: Event) => {
      const event = _event as NotificationClickEvent
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
  if (Notification?.permission !== 'granted') return

  const firebase = await loadFirebase()
  const messaging = firebase.messaging()
  messaging.deleteToken()
}

export const removeNotification = async (
  channelId: ChannelId | DMChannelId
) => {
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration) return
  const notifications = await registration.getNotifications({
    tag: `c:${channelId}`
  })
  notifications?.forEach(notification => notification.close())
}
