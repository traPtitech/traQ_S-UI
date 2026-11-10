import {
  createStaticAssetCachePlugin,
  isCacheableStaticAsset
} from '/@/sw/staticAssetCachePlugin'

const createResponse = (status: number, contentType?: string) =>
  new Response(status === 204 ? null : 'body', {
    status,
    headers: contentType ? { 'content-type': contentType } : {}
  })

const WOFF2 = ['font/woff2']

describe('isCacheableStaticAsset', () => {
  it.each(['font/woff2', 'font/woff2; charset=binary', ' Font/WOFF2 '])(
    'caches a 200 response with content-type %s',
    contentType => {
      expect(
        isCacheableStaticAsset(createResponse(200, contentType), WOFF2)
      ).toBe(true)
    }
  )

  it.each([
    'text/html',
    'text/html; charset=utf-8',
    'application/octet-stream',
    'font/woff',
    undefined
  ])('rejects content-type %s', contentType => {
    expect(
      isCacheableStaticAsset(createResponse(200, contentType), WOFF2)
    ).toBe(false)
  })

  it.each([204, 206, 404, 500])('rejects status %i', status => {
    expect(
      isCacheableStaticAsset(createResponse(status, 'font/woff2'), WOFF2)
    ).toBe(false)
  })

  it('accepts any of the given content types', () => {
    expect(
      isCacheableStaticAsset(createResponse(200, 'audio/mpeg'), ['audio/mpeg'])
    ).toBe(true)
  })
})

describe('createStaticAssetCachePlugin', () => {
  const cacheWillUpdate = async (response: Response) => {
    const callback = createStaticAssetCachePlugin(WOFF2).cacheWillUpdate
    if (!callback) throw new Error('cacheWillUpdate is not defined')
    return callback({
      request: new Request('https://example.com/fonts/a.woff2'),
      response,
      event: new Event('fetch') as ExtendableEvent,
      state: {}
    })
  }

  it('passes through a WOFF2 response', async () => {
    const response = createResponse(200, 'font/woff2')
    await expect(cacheWillUpdate(response)).resolves.toBe(response)
  })

  it('skips caching index.html returned for a missing font', async () => {
    await expect(
      cacheWillUpdate(createResponse(200, 'text/html; charset=utf-8'))
    ).resolves.toBeNull()
  })
})
