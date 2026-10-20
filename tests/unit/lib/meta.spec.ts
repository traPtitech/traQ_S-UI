describe('initializeMeta', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('traQConfig', {
      isRootChannelSelectableAsParentChannel: false
    })
  })

  afterEach(() => {
    vi.doUnmock('/@/lib/define')
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it.each(['development', 'production'])(
    'uses DEV_SERVER only in development (mode: %s)',
    async mode => {
      vi.stubEnv('MODE', mode)
      vi.doMock('/@/lib/define', () => ({
        DEV_SERVER: 'https://dev.example.com',
        VERSION: 'test'
      }))
      const { default: axios } = await import('axios')
      const get = vi.spyOn(axios, 'get').mockResolvedValue({
        data: { canonicalOrigin: 'https://canonical.example.com' }
      })
      const apis = await import('/@/lib/apis')

      await apis.initializeMeta()

      expect(get).toHaveBeenCalledTimes(mode === 'development' ? 0 : 1)
      expect(apis.embeddingOrigin).toBe(
        mode === 'development'
          ? 'https://dev.example.com'
          : 'https://canonical.example.com'
      )
    }
  )

  it.each([
    ['development', 'https://dev.example.com', 'https://dev.example.com'],
    ['development', '', 'https://configured.example.com'],
    ['production', 'https://dev.example.com', 'https://configured.example.com']
  ])(
    'uses an explicit origin without fetching metadata (mode: %s, DEV_SERVER: %s)',
    async (mode, devServer, expectedOrigin) => {
      vi.stubEnv('MODE', mode)
      vi.stubGlobal('traQConfig', {
        isRootChannelSelectableAsParentChannel: false,
        backendOrigin: 'https://configured.example.com'
      })
      vi.doMock('/@/lib/define', () => ({
        DEV_SERVER: devServer,
        VERSION: 'test'
      }))
      const { default: axios } = await import('axios')
      const get = vi.spyOn(axios, 'get').mockResolvedValue({
        data: { canonicalOrigin: 'https://canonical.example.com' }
      })
      const apis = await import('/@/lib/apis')

      await apis.initializeMeta()

      expect(get).not.toHaveBeenCalled()
      expect(apis.embeddingOrigin).toBe(expectedOrigin)
      expect(apis.buildFilePathForPost('file-id')).toBe(
        `${expectedOrigin}/files/file-id`
      )
    }
  )

  it.each([
    'https://q.example.com',
    'https://q-dev.example.com',
    'http://localhost:3000',
    'https://q.example.com:8443',
    'http://[::1]:3000'
  ])('uses %s for shared links without changing API paths', async origin => {
    const { default: axios } = await import('axios')
    const get = vi.spyOn(axios, 'get').mockResolvedValue({
      data: { canonicalOrigin: origin }
    })
    const apis = await import('/@/lib/apis')

    await apis.initializeMeta()

    expect(get).toHaveBeenCalledWith('/api/v3/meta', { timeout: 5000 })
    expect(apis.embeddingOrigin).toBe(origin)
    expect(apis.buildFilePathForPost('file-id')).toBe(`${origin}/files/file-id`)
    expect(apis.buildUserIconPathPublic('user')).toBe(
      `${origin}/api/v3/public/icon/user`
    )
    expect(apis.buildFilePath('file-id')).toBe('/api/v3/files/file-id')
  })

  it.each([undefined, ''])(
    'uses the current origin when the request fails (backendOrigin: %s)',
    async backendOrigin => {
      vi.stubGlobal('traQConfig', {
        isRootChannelSelectableAsParentChannel: false,
        backendOrigin
      })
      const { default: axios } = await import('axios')
      const get = vi
        .spyOn(axios, 'get')
        .mockRejectedValue(new Error('Network Error'))
      const apis = await import('/@/lib/apis')

      await expect(apis.initializeMeta()).resolves.toBeUndefined()

      expect(get).toHaveBeenCalledWith('/api/v3/meta', { timeout: 5000 })
      expect(apis.embeddingOrigin).toBe(location.origin)
    }
  )

  it.each([
    {},
    { canonicalOrigin: '' },
    { canonicalOrigin: 123 },
    { canonicalOrigin: 'invalid-url' },
    { canonicalOrigin: '//q.example.com' },
    { canonicalOrigin: 'https://q.example.com/app' },
    { canonicalOrigin: 'https://q.example.com/' },
    { canonicalOrigin: 'https://q.example.com?query=value' },
    { canonicalOrigin: 'https://q.example.com#fragment' },
    { canonicalOrigin: 'https://user:password@q.example.com' },
    { canonicalOrigin: 'ftp://q.example.com' },
    { canonicalOrigin: 'blob:https://q.example.com/id' }
  ])('uses the current origin for an invalid response: %j', async data => {
    const { default: axios } = await import('axios')
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data })
    const apis = await import('/@/lib/apis')

    await apis.initializeMeta()

    expect(get).toHaveBeenCalledWith('/api/v3/meta', { timeout: 5000 })
    expect(apis.embeddingOrigin).toBe(location.origin)
  })
})
