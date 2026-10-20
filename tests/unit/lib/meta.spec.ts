describe('initializeMeta', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('traQConfig', {
      isRootChannelSelectableAsParentChannel: false,
      backendOrigin: 'https://fallback.example.com'
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
    'https://q.example.com',
    'https://q-dev.example.com',
    'http://localhost:3000'
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

  it.each([undefined, 'https://fallback.example.com'])(
    'keeps the fallback origin when the request fails (backendOrigin: %s)',
    async backendOrigin => {
      vi.stubGlobal('traQConfig', {
        isRootChannelSelectableAsParentChannel: false,
        backendOrigin
      })
      const { default: axios } = await import('axios')
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'))
      const apis = await import('/@/lib/apis')

      await expect(apis.initializeMeta()).resolves.toBeUndefined()

      expect(apis.embeddingOrigin).toBe(backendOrigin ?? location.origin)
    }
  )

  it.each([{}, { canonicalOrigin: '' }, { canonicalOrigin: 123 }])(
    'keeps the fallback origin for an invalid response: %j',
    async data => {
      const { default: axios } = await import('axios')
      vi.spyOn(axios, 'get').mockResolvedValue({ data })
      const apis = await import('/@/lib/apis')

      await apis.initializeMeta()

      expect(apis.embeddingOrigin).toBe('https://fallback.example.com')
    }
  )
})
