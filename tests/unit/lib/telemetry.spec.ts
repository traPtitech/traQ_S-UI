import type { TransportBody } from '@grafana/faro-web-sdk'

const fetchMock = vi.fn()
const storage = new Map<string, string>()
const getItem = vi.fn((key: string) => storage.get(key) ?? null)

describe('telemetry', () => {
  let telemetry: (typeof import('/@/lib/telemetry'))['telemetry']

  beforeEach(async () => {
    vi.resetModules()
    storage.clear()
    getItem.mockReset().mockImplementation(key => storage.get(key) ?? null)
    vi.stubGlobal('localStorage', {
      getItem,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key)
    })
    telemetry = (await import('/@/lib/telemetry')).telemetry
    await import('@grafana/faro-web-sdk')
    vi.useFakeTimers()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset().mockResolvedValue({
      status: 202,
      headers: new Headers(),
      text: () => Promise.resolve('')
    })
    delete traQConfig.telemetry
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    delete traQConfig.telemetry
  })

  const sentBody = (): TransportBody =>
    JSON.parse(fetchMock.mock.calls[0]?.[1].body)

  it('does not send or create an identifier without configuration', async () => {
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it('sends repeated events without collecting page or user metadata', async () => {
    traQConfig.telemetry = { endpoint: '/telemetry/collect' }

    await telemetry.track('feature_flag_snapshot', {
      flag: 'contain_strict_alternate',
      enabled: true,
      source: 'default'
    })
    await telemetry.track('feature_flag_snapshot', {
      flag: 'contain_strict_alternate',
      enabled: true,
      source: 'default'
    })
    await vi.advanceTimersByTimeAsync(1000)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/telemetry/collect', location.origin).href,
      expect.objectContaining({
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      })
    )
    const body = sentBody()
    expect(body.events).toHaveLength(2)
    expect(body.events?.[0]?.attributes).toMatchObject({
      flag: 'contain_strict_alternate',
      enabled: 'true',
      source: 'default',
      schema_version: '1'
    })
    expect(body.events?.[0]?.attributes?.['event_id']).not.toBe(
      body.events?.[1]?.attributes?.['event_id']
    )
    expect(Object.keys(body.meta).sort()).toEqual(['app', 'sdk'])
    expect(body.meta.app).toMatchObject({
      name: 'traq-ui',
      version: 'test',
      environment: location.hostname
    })
    expect(body.events?.[0]?.attributes?.['client_id']).toBe(
      window.localStorage.getItem('telemetry/client-id')
    )
    expect(Object.keys(body).sort()).toEqual(['events', 'meta'])
  })

  it('does not collect from hosts outside the configured deployment list', async () => {
    traQConfig.telemetry = {
      endpoint: '/telemetry/collect',
      hosts: ['q.trap.jp']
    }
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it('reuses the browser identifier across reloads', async () => {
    traQConfig.telemetry = { endpoint: '/telemetry/collect' }
    window.localStorage.setItem('telemetry/client-id', 'existing-client')
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(1000)

    expect(sentBody().events?.[0]?.attributes?.['client_id']).toBe(
      'existing-client'
    )
  })

  it('continues when browser storage is unavailable', async () => {
    traQConfig.telemetry = { endpoint: '/telemetry/collect' }
    getItem.mockImplementation(() => {
      throw new DOMException('Storage denied', 'SecurityError')
    })
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(1000)

    expect(sentBody().events?.[0]?.attributes?.['client_id']).toBeTruthy()
  })

  it('ignores an invalid endpoint without breaking feature usage', async () => {
    traQConfig.telemetry = { endpoint: 'http://[' }
    await expect(
      telemetry.track('feature_used', { feature: 'search' })
    ).resolves.toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
