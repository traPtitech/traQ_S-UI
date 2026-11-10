import type { WorkboxPlugin } from 'workbox-core'

const getMediaType = (response: Response) =>
  (response.headers.get('content-type') ?? '')
    .split(';')[0]
    ?.trim()
    .toLowerCase() ?? ''

/**
 * 存在しないパスに対してサーバーが index.html を 200 で返す（SPA フォールバック）ため、
 * 期待する Content-Type の応答だけをキャッシュする。
 * CacheFirst で誤った応答がキャッシュされると、ファイル名が変わるまで壊れたままになる。
 * キャッシュしなければ次回のリクエストで取り直すので、サーバー側が直れば回復する。
 */
export const isCacheableStaticAsset = (
  response: Response,
  contentTypes: readonly string[]
) => response.status === 200 && contentTypes.includes(getMediaType(response))

export const createStaticAssetCachePlugin = (
  contentTypes: readonly string[]
): WorkboxPlugin => ({
  cacheWillUpdate: async ({ response }) =>
    isCacheableStaticAsset(response, contentTypes) ? response : null
})
