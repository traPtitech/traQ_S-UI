/* eslint-disable no-undef */
// TODO: Typescript化やimportはWorkbox5にアップデート時

/* workbox設定 */
{
  workbox.core.setCacheNameDetails({ prefix: 'traQ_S' })

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
  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

  // index.htmlが返ってくる箇所は予め指定 (refs src/router/index.ts)
  workbox.routing.registerNavigationRoute(
    workbox.precaching.getCacheKeyForURL('/index.html'),
    {
      whitelist: [
        new RegExp('/channels/'),
        new RegExp('/users/'),
        new RegExp('/messages/'),
        new RegExp('/files/'),
        new RegExp('/clip-folders/')
      ],
      blacklist: [
        new RegExp('/pipeline'),
        new RegExp('/widget/'),
        new RegExp('/api/'),
        new RegExp('/.well-known/')
      ]
    }
  )

  // ファイルAPIのキャッシュ設定
  workbox.routing.registerRoute(
    new RegExp('/api/v3/files/[0-9a-fA-F-]{36}$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'files-cache',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
          headers: {
            'X-TRAQ-FILE-CACHE': 'true'
          }
        })
      ]
    })
  )
  workbox.routing.registerRoute(
    new RegExp('/api/v3/files/[0-9a-fA-F-]{36}/thumbnail$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'thumbnail-cache',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200]
        })
      ]
    })
  )
}

// TODO: メッセージのキャッシュのDB

const getStore = async () => {
  try {
    const dbEvent = await new Promise((resolve, reject) => {
      const openReq = indexedDB.open('vuex')
      openReq.onsuccess = resolve
      openReq.onerror = reject
    })
    const db = dbEvent.target.result
    const storeEvent = await new Promise((resolve, reject) => {
      const getReq = db.transaction('vuex').objectStore('vuex').get('vuex')
      getReq.onsuccess = resolve
      getReq.onerror = reject
    })
    return storeEvent.target.result
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[sw] failed to get store: ${e}`)
    return null
  }
}

const postMessage = (channelId, text) =>
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
{
  importScripts('/config.js')
  const appName = self.traQConfig.name || 'traQ'

  // TODO: いい感じにする
  const ignoredChannels = ['#general', '#random']

  const showNotification = data => {
    const title = data.title
    const notificationTitle = title || appName
    const notificationOptions = data
    notificationOptions.data = data
    notificationOptions.renotify = true
    notificationOptions.badge = '/img/icons/badge.png'

    if (title && !ignoredChannels.includes(title)) {
      const verb = title.includes('#') ? '投稿' : '返信'
      notificationOptions.actions = [
        {
          action: 'reply',
          type: 'text',
          title: '返信',
          placeholder: `${title}へ${verb}する...`
        }
      ]
    }

    return self.registration
      .showNotification(notificationTitle, notificationOptions)
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('[sw] showNotification error:', err)
      })
  }

  const delay = () => new Promise(resolve => setTimeout(resolve, 0))

  self.addEventListener('notificationclick', event => {
    if (event.reply) {
      const data = event.notification.data
      const channelId = data.tag.slice('c:'.length)
      // https://crbug.com/1050352#c5
      // androidでしか通知の再度の発火は発生しない模様
      event.waitUntil(
        (async () => {
          try {
            const [store] = await Promise.all([
              getStore(),
              postMessage(channelId, event.reply)
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

            return showNotification(data)
              .then(delay)
              .then(() => {
                return self.registration.getNotifications({ tag: data.tag })
              })
              .then(notifications =>
                notifications.forEach(notification => notification.close())
              )
          }
        })()
      )
      return
    }
    event.notification.close()

    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientsArr => {
          if (clientsArr.length > 0) {
            return clientsArr[0].focus().then(client =>
              client.postMessage({
                type: 'navigate',
                to: event.notification.data.path
              })
            )
          } else {
            return clients.openWindow(event.notification.data.path)
          }
        })
    )
  })

  if (self.traQConfig.firebase !== undefined) {
    importScripts('https://www.gstatic.com/firebasejs/8.4.2/firebase-app.js')
    importScripts(
      'https://www.gstatic.com/firebasejs/8.4.2/firebase-messaging.js'
    )

    firebase.initializeApp(self.traQConfig.firebase)

    const messaging = firebase.messaging()

    messaging.onBackgroundMessage(payload => {
      if (payload.data && payload.data.type === 'new_message') {
        return showNotification(payload.data)
      }
    })
  }
}
