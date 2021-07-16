import { setCacheNameDetails } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import firebase from 'firebase/app'
import 'firebase/messaging'
import { UserDetail } from '@traptitech/traq'
import { ChannelId } from './types/entity-ids'
import {
  ExtendedNotificationOptions,
  NotificationClickEvent
} from '@/types/InlineNotificationReplies'
import { createNotificationArgumentsCreator } from '@/lib/notification/notificationArguments'

declare const self: ServiceWorkerGlobalScope

/**
 * IndexedDBに保存されているStoreの状態
 */
type PStore = {
  domain: {
    me: {
      detail: UserDetail
    }
  }
}

/* workbox設定 */
{
  setCacheNameDetails({ prefix: 'traQ_S' })

  /* アップデート */
  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  })
}

/* ルーティングのキャッシュ関係 */
{
  // 静的ファイルのprecache
  precacheAndRoute(self.__WB_MANIFEST)

  // index.htmlが返ってくる箇所は予め指定 (refs src/router/index.ts)
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/index.html'), {
      allowlist: [
        new RegExp('/channels/'),
        new RegExp('/users/'),
        new RegExp('/messages/'),
        new RegExp('/files/'),
        new RegExp('/clip-folders/')
      ],
      denylist: [
        new RegExp('/pipeline'),
        new RegExp('/widget/'),
        new RegExp('/api/'),
        new RegExp('/.well-known/')
      ]
    })
  )

  // ファイルAPIのキャッシュ設定
  registerRoute(
    new RegExp('/api/v3/files/[0-9a-fA-F-]{36}$'),
    new CacheFirst({
      cacheName: 'files-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: {
            'X-TRAQ-FILE-CACHE': 'true'
          }
        })
      ]
    })
  )
  registerRoute(
    new RegExp('/api/v3/files/[0-9a-fA-F-]{36}/thumbnail$'),
    new CacheFirst({
      cacheName: 'thumbnail-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    })
  )
}

// TODO: メッセージのキャッシュのDB

const getStore = async () => {
  try {
    const dbEvent = await new Promise<Event>((resolve, reject) => {
      const openReq = indexedDB.open('vuex')
      openReq.onsuccess = resolve
      openReq.onerror = reject
    })
    const db = (dbEvent.target as IDBOpenDBRequest).result
    const storeEvent = await new Promise<Event>((resolve, reject) => {
      const getReq = db.transaction('vuex').objectStore('vuex').get('vuex')
      getReq.onsuccess = resolve
      getReq.onerror = reject
    })
    return (storeEvent.target as IDBRequest<PStore | Record<string, never>>)
      .result
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[sw] failed to get store: ${e}`)
    return null
  }
}

const postMessage = (channelId: ChannelId, text: string) =>
  fetch(`/api/v3/channels/${channelId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: text, embed: true })
  })

/* 通知関係 */
// refs src/lib/firebase.ts showNotification()
;(async () => {
  // @ts-expect-error config.jsの型定義ファイルはつくらない
  await import('/config.js')

  const appName = self.traQConfig.name || 'traQ'
  const ignoredChannels = self.traQConfig.inlineReplyDisableChannels || []
  const createNotificationArguments = createNotificationArgumentsCreator(
    appName,
    ignoredChannels
  )

  const showNotification = (options: ExtendedNotificationOptions) => {
    const title = options.data.title
    const [notificationTitle, notificationOptions] =
      createNotificationArguments(title, options)
    notificationOptions.data = notificationOptions

    return self.registration
      .showNotification(notificationTitle, notificationOptions)
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('[sw] showNotification error:', err)
      })
  }

  const delay = () => new Promise(resolve => setTimeout(resolve, 0))

  self.addEventListener('notificationclick', _event => {
    const event = _event as NotificationClickEvent
    if (event.reply) {
      const data = event.notification.data
      const channelId = data.tag.slice('c:'.length)

      // https://crbug.com/1050352#c5
      // androidでしか通知の再度の発火は発生しない模様
      const until = async () => {
        try {
          const [store] = await Promise.all([
            getStore(),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            postMessage(channelId, event.reply!)
          ])
          event.notification.close()

          if (store && store.domain.me.detail) {
            const me = store.domain.me.detail
            data.body = `${me.displayName}: ${event.reply}`
            data.icon = `/api/v3/files/${me.iconFileId}`
          } else {
            // eslint-disable-next-line no-console
            console.warn('[sw] no store or me.detail found')
            data.body = `自分: ${event.reply}`
          }

          data.silent = true
          return showNotification(data)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[sw] sendReply error:', err)

          await showNotification(data)
          await delay()

          const notifications = await self.registration.getNotifications({
            tag: data.tag
          })
          notifications.forEach(notification => notification.close())
        }
      }

      event.waitUntil(until())
      return
    }
    event.notification.close()

    const openChannel = async () => {
      const clientsArr = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      if (clientsArr.length > 0) {
        const client = await clientsArr[0].focus()
        return client.postMessage({
          type: 'navigate',
          to: event.notification.data.path
        })
      } else {
        return self.clients.openWindow(event.notification.data.path)
      }
    }
    event.waitUntil(openChannel())
  })

  if (self.traQConfig.firebase !== undefined) {
    firebase.initializeApp(self.traQConfig.firebase)

    const messaging = firebase.messaging()

    messaging.onBackgroundMessage(payload => {
      if (payload.data && payload.data.type === 'new_message') {
        return showNotification(payload.data)
      }
    })
  }
})()
