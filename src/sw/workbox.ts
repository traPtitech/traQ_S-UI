import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate
} from 'workbox-strategies'

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
  cleanupOutdatedCaches()
  // 静的ファイルのprecache
  precacheAndRoute(self.__WB_MANIFEST)

  const configPath = '/config.js'
  const configStrategy = new NetworkFirst({
    cacheName: 'runtime-config-cache',
    networkTimeoutSeconds: 3,
    fetchOptions: { cache: 'no-cache' }
  })

  // 次回の起動がオフラインでも設定を読み込めるようにする。
  self.addEventListener('install', event => {
    event.waitUntil(
      Promise.all(configStrategy.handleAll({ event, request: configPath }))
    )
  })

  registerRoute(
    ({ sameOrigin, url }) => sameOrigin && url.pathname === configPath,
    configStrategy
  )

  registerRoute(
    new RegExp('/assets/.+\\.mp3$'),
    // ファイル名にハッシュが付与されているのでCacheFirst
    new CacheFirst({
      cacheName: 'assets-custom-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    })
  )

  // index.htmlが返ってくる箇所は予め指定 (refs src/router/index.ts)
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/index.html'), {
      allowlist: [
        new RegExp('/channels/'),
        new RegExp('/users/'),
        new RegExp('/messages/'),
        new RegExp('/files/'),
        new RegExp('/clip-folders/'),
        new RegExp('/group-manager/'),
        new RegExp('/settings/'),
        new RegExp('/share-target'),
        new RegExp('/login'),
        new RegExp('/registration'),
        new RegExp('/consent')
      ],
      denylist: [
        new RegExp('/widget/'),
        new RegExp('/api/'),
        new RegExp('/.well-known/')
      ]
    })
  )

  // ファイルAPIのキャッシュ設定
  registerRoute(
    // メディアとRange要求はブラウザに処理させる。
    // ストレージへのリダイレクトをSW経由で返すとFirefoxで再生に失敗する場合がある。
    ({ url, request, sameOrigin }) =>
      sameOrigin &&
      /^\/api\/v3\/files\/[0-9a-fA-F-]{36}$/.test(url.pathname) &&
      !url.search &&
      request.destination !== 'audio' &&
      request.destination !== 'video' &&
      !request.headers.has('range'),
    new CacheFirst({
      cacheName: 'files-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
          headers: {
            'X-TRAQ-FILE-CACHE': 'true'
          }
        })
        // スタンプの画像もここに入るので最大数を制限しない
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
        }),
        new ExpirationPlugin({
          maxEntries: 500
        })
      ]
    })
  )

  // google font
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets'
    })
  )
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new ExpirationPlugin({
          maxEntries: 30
        })
      ]
    })
  )
}
