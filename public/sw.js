// TODO: Typescript化やimportはWorkbox5にアップデート時

/* workbox設定 */
{
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()

  workbox.core.setCacheNameDetails({ prefix: 'traQ_S' })

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
        new RegExp('/files/')
      ],
      blacklist: [new RegExp('/pipeline'), new RegExp('/api/')]
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

// TODO: 自分の情報のキャッシュのDB
// TODO: メッセージのキャッシュのDB

/* 通知関係 */
// TODO: 通知からの返信
// refs src/lib/firebase.ts showNotification()
{
  const showNotification = data => {
    // Customize notification here
    const title = data.title
    const notificationTitle = title || 'traQ'
    const notificationOptions = data
    notificationOptions.data = data
    notificationOptions.renotify = true
    notificationOptions.badge = '/img/icons/badge.png'
    /*
    if (title && !['#general', '#random'].includes(title)) {
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
    */

    return self.registration
      .showNotification(notificationTitle, notificationOptions)
      .catch(err => {
        console.error('[sw] showNotification error:', err)
      })
  }

  // const delay = () => new Promise(resolve => setTimeout(resolve, 0))

  self.addEventListener('notificationclick', event => {
    /*
    if (event.reply) {
      const data = event.notification.data
      const channelID = data.tag.slice('c:'.length)
      // https://crbug.com/1050352#c5
      // androidでしか通知の再度の発火は発生しない模様
      event.waitUntil(
        Promise.all([
          getMeData(),
          fetch(`/api/1.0/channels/${channelID}/messages?embed=1`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: event.reply
            })
          })
        ]).then(
          ([{ data: me }]) => {
            event.notification.close()
            data.body = `${me.displayName}: ${event.reply}`
            data.icon = `/api/1.0/public/icon/${me.name}`
            data.silent = true
            return showNotification(data)
          },
          err => {
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
        )
      )
      return
    }
    */
    event.notification.close()

    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientsArr => {
          if (clientsArr.length > 0) {
            return clientsArr[0].focus().then(function (client) {
              const data = {
                type: 'navigate',
                to: event.notification.data.path
              }
              return client.postMessage(data)
            })
          } else {
            return clients.openWindow(event.notification.data.path)
          }
        })
    )
  })

  importScripts('https://www.gstatic.com/firebasejs/7.14.1/firebase-app.js')
  importScripts(
    'https://www.gstatic.com/firebasejs/7.14.1/firebase-messaging.js'
  )

  firebase.initializeApp({
    apiKey: 'AIzaSyDee_VkrRtByJCrCZAX3nTSDPl8AaHlWfY',
    projectId: 'traq-r',
    appId: '1:993645413001:web:b253ea3776d6cf85163c58',
    messagingSenderId: '993645413001'
  })

  const messaging = firebase.messaging()

  messaging.setBackgroundMessageHandler(payload =>
    showNotification(payload.data)
  )
}
