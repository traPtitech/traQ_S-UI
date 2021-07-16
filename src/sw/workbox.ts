import { setCacheNameDetails } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

/**
 * workbox設定
 */
export const setupWorkbox = () => {
  setCacheNameDetails({ prefix: 'traQ_S' })

  /* アップデート */
  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  })

  /* ルーティングのキャッシュ関係 */
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
