import type { TransportBody } from '@grafana/faro-web-sdk'

import type { telemetry as ActivityTelemetry } from '/@/lib/telemetry'

const fetchMock = vi.fn()
const storage = new Map<string, string>()
const getItem = vi.fn((key: string) => storage.get(key) ?? null)
const deployedTelemetry = {
  endpoint: '/telemetry/collect',
  hosts: ['q-dev.trapti.tech', 'q.trapti.tech']
}

const macSafariUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'

describe('telemetry', () => {
  let telemetry: typeof ActivityTelemetry
  let stopErrorCollection: (() => void) | undefined

  beforeEach(async () => {
    vi.resetModules()
    vi.stubGlobal('isSecureContext', true)
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
  })

  afterEach(() => {
    stopErrorCollection?.()
    stopErrorCollection = undefined
    vi.restoreAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const sentBody = (): TransportBody =>
    JSON.parse(fetchMock.mock.calls[0]?.[1].body)

  it('does not send or create an identifier without configuration', async () => {
    expect(telemetry.startErrorCollection()).toBeUndefined()
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it.for([
    {
      name: 'Edge on Windows',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86',
      standalone: true,
      expected: {
        browser_name: 'Edge',
        browser_major_version: '131',
        os_name: 'Windows',
        launch_mode: 'pwa'
      }
    },
    {
      name: 'a touch-enabled device with the Mac UA',
      userAgent: macSafariUserAgent,
      touchEvents: true,
      standalone: false,
      expected: {
        browser_name: 'Safari',
        browser_major_version: '26',
        os_name: 'macOS or iOS/iPadOS',
        launch_mode: 'browser'
      }
    },
    {
      name: 'an iPad with the mobile UA',
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
      standalone: false,
      expected: {
        browser_name: 'Mobile Safari',
        browser_major_version: '26',
        os_name: 'iOS',
        launch_mode: 'browser'
      }
    },
    {
      name: 'Safari on a Mac',
      userAgent: macSafariUserAgent,
      touchEvents: false,
      standalone: false,
      expected: {
        browser_name: 'Safari',
        browser_major_version: '26',
        os_name: 'Mac OS',
        launch_mode: 'browser'
      }
    },
    {
      name: 'an unknown UA',
      userAgent: 'Unknown',
      standalone: false,
      expected: { launch_mode: 'browser' }
    }
  ])(
    'sends selected environment attributes in both events for $name',
    async (
      { userAgent, touchEvents, standalone, expected },
      { onTestFinished }
    ) => {
      vi.stubGlobal('traQConfig', {
        telemetry: { endpoint: '/telemetry/collect' }
      })
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: standalone && query === '(display-mode: standalone)'
      }))

      const touchEnd = Object.getOwnPropertyDescriptor(
        Document.prototype,
        'ontouchend'
      )

      if (touchEvents === false && touchEnd) {
        Reflect.deleteProperty(Document.prototype, 'ontouchend')
        onTestFinished(() => {
          Object.defineProperty(Document.prototype, 'ontouchend', touchEnd)
        })
      }

      vi.resetModules()
      telemetry = (await import('/@/lib/telemetry')).telemetry
      await telemetry.trackAppStarted()
      await telemetry.trackClientEnvironmentSnapshot()
      await vi.advanceTimersByTimeAsync(1000)

      const body = sentBody()
      expect(body.events?.map(event => event.name)).toEqual([
        'app_started',
        'client_environment_snapshot'
      ])

      const clientId = body.events?.[0]?.attributes?.['client_id']
      expect(clientId).toEqual(expect.any(String))
      for (const event of body.events ?? []) {
        expect(event.attributes).toEqual({
          ...expected,
          client_id: clientId,
          event_id: expect.any(String),
          schema_version: '1'
        })
      }

      expect(Object.keys(body.meta).sort()).toEqual(['app', 'sdk'])
    }
  )

  it('reports browser and console errors with safe diagnostic fields', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    const consoleError = vi
      .spyOn(window.console, 'error')
      .mockImplementation(() => undefined)
    stopErrorCollection = telemetry.startErrorCollection()
    expect(telemetry.startErrorCollection()).toBe(stopErrorCollection)

    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'private exception text',
        filename: `${location.origin}/assets/main-hash.js?private=token`,
        lineno: 24,
        colno: 5
      })
    )

    const error = new TypeError('private error message', {
      cause: { authorization: 'private credential' }
    })
    error.stack = [
      'TypeError: private error message',
      `    at privateFunction (${location.origin}/assets/main-hash.js?private=token:31:8)`,
      `    at fetch (${location.origin}/api/v3/files/private-id:4:1)`,
      '    at thirdParty (https://example.org/assets/extension.js:1:2)'
    ].join('\n')
    const rejection = new Event('unhandledrejection')
    Object.defineProperty(rejection, 'reason', { value: error })
    window.dispatchEvent(rejection)
    window.console.error('private console text', error)

    await vi.advanceTimersByTimeAsync(1000)

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      'private console text',
      error
    )
    expect(fetchMock).toHaveBeenCalledOnce()
    const body = sentBody()
    const clientId = window.localStorage.getItem('telemetry/client-id')
    expect(body.exceptions).toEqual([
      {
        timestamp: expect.any(String),
        type: 'Error',
        value: 'window_error',
        context: { client_id: clientId, source: 'window_error' },
        stacktrace: {
          frames: [
            {
              filename: '/assets/main-hash.js',
              function: '?',
              lineno: 24,
              colno: 5
            }
          ]
        }
      },
      {
        timestamp: expect.any(String),
        type: 'TypeError',
        value: 'unhandled_rejection',
        context: { client_id: clientId, source: 'unhandled_rejection' },
        stacktrace: {
          frames: [
            {
              filename: '/assets/main-hash.js',
              function: '?',
              lineno: 31,
              colno: 8
            }
          ]
        }
      },
      {
        timestamp: expect.any(String),
        type: 'TypeError',
        value: 'console_error',
        context: { client_id: clientId, source: 'console_error' }
      }
    ])
    expect(Object.keys(body.meta).sort()).toEqual(['app', 'sdk'])
  })

  it('limits error bursts while allowing activity events in the same batch', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    stopErrorCollection = telemetry.startErrorCollection()

    for (let i = 0; i < 11; i++) {
      window.dispatchEvent(new ErrorEvent('error'))
    }

    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(1000)

    expect(sentBody().exceptions).toHaveLength(10)
    expect(sentBody().events).toHaveLength(1)
  })

  it('sends repeated events without collecting page or user metadata', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })

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
        credentials: 'same-origin',
        mode: 'same-origin',
        redirect: 'error',
        headers: expect.objectContaining({ 'X-Traq-Telemetry': '1' }),
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

  it.each([
    ['q-dev.trapti.tech', undefined],
    ['q.trapti.tech', 'https://q.trap.jp']
  ])(
    'sends from %s to its own authenticated collector',
    async (host, backendOrigin) => {
      vi.stubGlobal('location', new URL(`https://${host}/channels/test`))
      vi.stubGlobal('traQConfig', {
        backendOrigin,
        telemetry: deployedTelemetry
      })

      await telemetry.track('feature_used', { feature: 'search' })
      await vi.advanceTimersByTimeAsync(1000)

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        `https://${host}/telemetry/collect`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'same-origin',
          mode: 'same-origin',
          redirect: 'error',
          headers: expect.objectContaining({ 'X-Traq-Telemetry': '1' })
        })
      )
      expect(sentBody().meta.app?.environment).toBe(host)
    }
  )

  it.each([
    'q.trap.jp',
    'staging-dev.traq-preview.trapti.tech',
    'staging-prod.traq-preview.trapti.tech',
    '5368-dev.traq-preview.trapti.tech',
    '5368-prod.traq-preview.trapti.tech'
  ])('does not collect from the excluded host %s', async host => {
    vi.stubGlobal('location', new URL(`https://${host}`))
    vi.stubGlobal('traQConfig', { telemetry: deployedTelemetry })

    expect(telemetry.startErrorCollection()).toBeUndefined()
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it('reuses the browser identifier across reloads', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    window.localStorage.setItem('telemetry/client-id', 'existing-client')
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(1000)

    expect(sentBody().events?.[0]?.attributes?.['client_id']).toBe(
      'existing-client'
    )
  })

  it('continues when browser storage is unavailable', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    getItem.mockImplementation(() => {
      throw new DOMException('Storage denied', 'SecurityError')
    })
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(1000)

    expect(sentBody().events?.[0]?.attributes?.['client_id']).toBeTruthy()
  })

  it('ignores an invalid endpoint without breaking feature usage', async () => {
    vi.stubGlobal('traQConfig', { telemetry: { endpoint: 'http://[' } })
    expect(telemetry.startErrorCollection()).toBeUndefined()
    await expect(
      telemetry.track('feature_used', { feature: 'search' })
    ).resolves.toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not send to another origin', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: 'https://collector.example.com/collect' }
    })
    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it('does not initialize in an insecure context', async () => {
    vi.stubGlobal('isSecureContext', false)
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    const sdk = await import('@grafana/faro-web-sdk')
    const initializeFaro = vi.spyOn(sdk, 'initializeFaro')

    await telemetry.track('feature_used', { feature: 'search' })
    await vi.advanceTimersByTimeAsync(2000)

    expect(initializeFaro).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)
  })

  it('retries initialization after failure and shares the retry across events', async () => {
    vi.stubGlobal('traQConfig', {
      telemetry: { endpoint: '/telemetry/collect' }
    })
    const sdk = await import('@grafana/faro-web-sdk')
    const initializeFaro = vi
      .spyOn(sdk, 'initializeFaro')
      .mockImplementationOnce(() => {
        throw new Error('Initialization failed')
      })

    await expect(
      telemetry.track('feature_used', { feature: 'failed' })
    ).resolves.toBeUndefined()
    await Promise.all([
      telemetry.track('feature_used', { feature: 'search' }),
      telemetry.track('feature_used', { feature: 'channel_list' })
    ])
    await vi.advanceTimersByTimeAsync(1000)

    expect(initializeFaro).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(
      sentBody().events?.map(event => event.attributes?.['feature'])
    ).toEqual(['search', 'channel_list'])
  })
})
