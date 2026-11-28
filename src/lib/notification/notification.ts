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
  if (hasNotificationApi() && Notification.permission === 'granted') {
    return new Notification(notificationTitle, notificationOptions)
  }
  return null
}

const hasNotificationApi = () => 'Notification' in window

/**
 * 通知の許可を求める案内を、この端末で既に出したかどうかを記録するキー
 */
const notificationPromptShownKey = 'traQ_S-notificationPromptShown'

const hasShownNotificationPrompt = () => {
  try {
    return localStorage.getItem(notificationPromptShownKey) !== null
  } catch {
    return false
  }
}

const markNotificationPromptShown = () => {
  try {
    localStorage.setItem(notificationPromptShownKey, new Date().toISOString())
  } catch {
    // localStorage が使えない場合は毎回出ることになるが、動作には問題ない
  }
}

let serviceWorkerRegistration: ServiceWorkerRegistration | undefined
let messagingSetupPromise: Promise<void> | undefined

const setupMessaging = async (registration: ServiceWorkerRegistration) => {
  const firebaseApp = getFirebaseApp()
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
  await apis.registerFCMDevice({ token })
}

/**
 * 通知が許可されていれば、プッシュ通知を受け取れるようにする (FCM トークンの登録など)
 *
 * 起動時のほか、あとから通知が許可されたときにも呼ぶ。何度呼んでも一度だけ行う
 */
const enableNotificationIfPermitted = async () => {
  if (!hasNotificationApi() || Notification.permission !== 'granted') return
  // Service Worker の登録が終わっていなければ、登録後に connectFirebase から呼ばれる
  if (!serviceWorkerRegistration) return

  messagingSetupPromise ??= setupMessaging(serviceWorkerRegistration).catch(
    e => {
      // 失敗したら次の機会にやり直せるようにする
      messagingSetupPromise = undefined
      // eslint-disable-next-line no-console
      console.warn('[Notification] failed to set up messaging', e)
    }
  )
  await messagingSetupPromise
}

/**
 * 通知の許可を求める
 *
 * 許可された場合はプッシュ通知を受け取れるようにする。
 * WebKit ではユーザー操作 (クリックなど) を起点に呼ぶ必要がある
 */
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!hasNotificationApi()) return 'denied'

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      notify({ title: `ようこそ${appName}へ！！` }, true)
      await enableNotificationIfPermitted()
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[Notification] permission ${permission}`)
    }
    return permission
  }

/**
 * 通知の許可を求める
 *
 * WebKit (iOS / Safari) ではユーザー操作を起点にしないと許可のダイアログを出せず、
 * 許可も拒否もしないと状態が 'default' のまま変わらない。
 * そのため案内のトーストは端末ごとに一度だけ出し、あとは 設定 > ブラウザ から許可してもらう。
 */
const promptNotificationPermission = () => {
  if (!hasNotificationApi() || Notification.permission !== 'default') return

  if (!(isWebKit() && isPWA())) {
    void requestNotificationPermission().catch(e => {
      // eslint-disable-next-line no-console
      console.warn('[Notification] failed to request permission', e)
    })
    return
  }

  if (hasShownNotificationPrompt()) return
  markNotificationPromptShown()

  const { addToast, deleteToast } = useToastStore()
  addToast({
    type: 'info',
    text: '【通知を有効にしてください】\nメッセージ受信時に通知が届くようになります。（クリックで許可）\nあとから 設定 > ブラウザ でも変更できます。',
    timeout: 30000,
    onClick: id => {
      deleteToast(id)
      void requestNotificationPermission().catch(e => {
        // eslint-disable-next-line no-console
        console.warn('[Notification] failed to request permission', e)
      })
    }
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

  if (hasNotificationApi()) {
    // 許可を待たずに Service Worker の登録などを進める
    promptNotificationPermission()
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[Notification] Notification does not exists`)
  }

  setupFirebaseApp()

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
  serviceWorkerRegistration = registration

  setupUpdateToast(registration, onCanUpdate)

  if (!hasNotificationApi() || Notification.permission !== 'granted') {
    // eslint-disable-next-line no-console
    console.warn(
      `[Notification] permission ${hasNotificationApi() ? Notification.permission : 'unsupported'}`
    )
    return
  }
  await enableNotificationIfPermitted()
}

export const deleteToken = () => {
  if (!hasNotificationApi() || Notification.permission !== 'granted') return

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
