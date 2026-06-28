import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import createBeaconDispatcher from '/@/lib/beacon'

describe('createBeaconDispatcher', () => {
  // Mock fetch globally
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Helper to create mock Axios request function
  const createMockAxiosRequest = (
    configOverrides: Partial<InternalAxiosRequestConfig> = {}
  ) => {
    return vi.fn(
      async (
        ...args: unknown[]
      ): Promise<AxiosResponse<Record<string, never>>> => {
        // The last argument should be the options with adapter
        const options = args[args.length - 1] as {
          adapter?: (
            config: InternalAxiosRequestConfig
          ) => Promise<AxiosResponse>
        }

        const config: InternalAxiosRequestConfig = {
          url: '/api/test',
          method: 'POST',
          data: JSON.stringify({ key: 'value' }),
          headers: {} as InternalAxiosRequestConfig['headers'],
          ...configOverrides
        }

        // If adapter is provided (dummy adapter), use it
        if (options?.adapter) {
          return options.adapter(config)
        }

        // Otherwise return a mock response
        return {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }
    )
  }

  describe('dispatcher creation', () => {
    it('should create a dispatcher function', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      expect(typeof dispatcher).toBe('function')
    })

    it('should call the request function to extract config', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      await createBeaconDispatcher(mockRequest, 'arg1', 'arg2')

      // Request should be called with args + adapter option
      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith('arg1', 'arg2', {
        adapter: expect.any(Function)
      })
    })

    it('should pass all arguments to the request function', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      await createBeaconDispatcher(mockRequest, 'first', 123, { nested: true })

      expect(mockRequest).toHaveBeenCalledWith(
        'first',
        123,
        { nested: true },
        { adapter: expect.any(Function) }
      )
    })
  })

  describe('dispatcher execution', () => {
    it('should call fetch with the extracted config', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/beacon',
        method: 'POST',
        data: '{"message":"hello"}'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/beacon',
        expect.objectContaining({
          url: '/api/beacon',
          method: 'POST',
          body: '{"message":"hello"}',
          keepalive: true
        })
      )
    })

    it('should set keepalive to true', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          keepalive: true
        })
      )
    })

    it('should use config.data as fetch body', async () => {
      const testData = JSON.stringify({ userId: 123, action: 'logout' })
      const mockRequest = createMockAxiosRequest({
        url: '/api/track',
        data: testData
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/track',
        expect.objectContaining({
          body: testData
        })
      )
    })

    it('should resolve when fetch returns ok: true', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).resolves.toBeUndefined()
    })

    it('should throw when fetch returns ok: false', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('Internal Server Error')
    })

    it('should throw when fetch rejects', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockRejectedValue(new Error('Network error'))

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('Network error')
    })
  })

  describe('URL handling', () => {
    it('should reject when URL is empty', async () => {
      const mockRequest = createMockAxiosRequest({ url: '' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('URL must not be empty')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should reject when URL is undefined', async () => {
      const mockRequest = createMockAxiosRequest({ url: undefined })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('URL must not be empty')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should work with relative URLs', async () => {
      const mockRequest = createMockAxiosRequest({ url: '/api/relative' })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/relative',
        expect.any(Object)
      )
    })

    it('should work with absolute URLs', async () => {
      const mockRequest = createMockAxiosRequest({
        url: 'https://api.example.com/beacon'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/beacon',
        expect.any(Object)
      )
    })
  })

  describe('config spreading', () => {
    it('should spread config properties to fetch options', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/test',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token'
        } as InternalAxiosRequestConfig['headers']
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token'
          })
        })
      )
    })
  })

  describe('dispatcher reusability', () => {
    it('should be able to call dispatcher multiple times', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await dispatcher()
      await dispatcher()
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should use same config for each call', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/fixed',
        data: 'fixed-data'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await dispatcher()
      await dispatcher()

      // Both calls should have the same config
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        '/api/fixed',
        expect.objectContaining({ body: 'fixed-data' })
      )
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        '/api/fixed',
        expect.objectContaining({ body: 'fixed-data' })
      )
    })

    it('should create independent dispatchers', async () => {
      const mockRequest1 = createMockAxiosRequest({ url: '/api/first' })
      const mockRequest2 = createMockAxiosRequest({ url: '/api/second' })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher1 = await createBeaconDispatcher(mockRequest1)
      const dispatcher2 = await createBeaconDispatcher(mockRequest2)

      await dispatcher1()
      await dispatcher2()

      expect(mockFetch).toHaveBeenCalledWith('/api/first', expect.any(Object))
      expect(mockFetch).toHaveBeenCalledWith('/api/second', expect.any(Object))
    })
  })

  describe('edge cases', () => {
    it('should handle empty data', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/test',
        data: undefined
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          body: undefined
        })
      )
    })

    it('should handle FormData as data', async () => {
      const formData = new FormData()
      formData.append('file', 'content')

      const mockRequest = createMockAxiosRequest({
        url: '/api/upload',
        data: formData
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          body: formData
        })
      )
    })

    it('should handle null data', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/test',
        data: null
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          body: null
        })
      )
    })

    it('should preserve method from config', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/test',
        method: 'DELETE'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('error handling', () => {
    it('should propagate fetch errors', async () => {
      const mockRequest = createMockAxiosRequest()
      const fetchError = new TypeError('Failed to fetch')
      mockFetch.mockRejectedValue(fetchError)

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('Failed to fetch')
    })

    it('should handle HTTP errors gracefully', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('Bad Request')
    })

    it('should handle empty statusText', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: ''
      })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      await expect(dispatcher()).rejects.toThrow('')
    })
  })

  describe('HTTP methods', () => {
    it('should work with GET method', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/ping',
        method: 'GET'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ping',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should work with POST method', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/submit',
        method: 'POST',
        data: '{"action":"submit"}'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/submit',
        expect.objectContaining({
          method: 'POST',
          body: '{"action":"submit"}'
        })
      )
    })

    it('should work with PATCH method', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/update',
        method: 'PATCH'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/update',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('should work with PUT method', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/replace',
        method: 'PUT'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/replace',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('should work with DELETE method', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/remove',
        method: 'DELETE'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/remove',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('concurrent dispatching', () => {
    it('should handle multiple concurrent dispatches', async () => {
      const mockRequest = createMockAxiosRequest({ url: '/api/concurrent' })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      // Fire multiple dispatches concurrently
      await Promise.all([
        dispatcher(),
        dispatcher(),
        dispatcher(),
        dispatcher(),
        dispatcher()
      ])

      expect(mockFetch).toHaveBeenCalledTimes(5)
    })

    it('should handle mixed success and failure in concurrent dispatches', async () => {
      const mockRequest = createMockAxiosRequest({ url: '/api/mixed' })

      mockFetch
        .mockResolvedValueOnce({ ok: true, statusText: 'OK' })
        .mockResolvedValueOnce({ ok: false, statusText: 'Error' })
        .mockResolvedValueOnce({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      const results = await Promise.allSettled([
        dispatcher(),
        dispatcher(),
        dispatcher()
      ])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
    })

    it('should create multiple independent dispatchers concurrently', async () => {
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const [dispatcher1, dispatcher2, dispatcher3] = await Promise.all([
        createBeaconDispatcher(createMockAxiosRequest({ url: '/api/1' })),
        createBeaconDispatcher(createMockAxiosRequest({ url: '/api/2' })),
        createBeaconDispatcher(createMockAxiosRequest({ url: '/api/3' }))
      ])

      await Promise.all([dispatcher1(), dispatcher2(), dispatcher3()])

      expect(mockFetch).toHaveBeenCalledWith('/api/1', expect.any(Object))
      expect(mockFetch).toHaveBeenCalledWith('/api/2', expect.any(Object))
      expect(mockFetch).toHaveBeenCalledWith('/api/3', expect.any(Object))
    })
  })

  describe('real-world patterns', () => {
    it('should simulate page unload analytics beacon', async () => {
      const analyticsData = JSON.stringify({
        event: 'page_unload',
        duration: 12345,
        scrollDepth: 75
      })

      const mockRequest = createMockAxiosRequest({
        url: '/api/analytics',
        method: 'POST',
        data: analyticsData
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      // Create dispatcher before unload
      const dispatcher = await createBeaconDispatcher(mockRequest)

      // Called during page unload
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics',
        expect.objectContaining({
          body: analyticsData,
          keepalive: true
        })
      )
    })

    it('should simulate subscription state sync on background', async () => {
      const subscriptionData = JSON.stringify({
        channelId: 'channel-123',
        level: 2
      })

      const mockRequest = createMockAxiosRequest({
        url: '/api/channels/channel-123/subscription',
        method: 'PUT',
        data: subscriptionData
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/channels/channel-123/subscription',
        expect.objectContaining({
          method: 'PUT',
          body: subscriptionData,
          keepalive: true
        })
      )
    })

    it('should simulate heartbeat ping', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/heartbeat',
        method: 'POST',
        data: JSON.stringify({ timestamp: Date.now() })
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)

      // Multiple heartbeats
      await dispatcher()
      await dispatcher()
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should simulate logout notification', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/logout',
        method: 'POST',
        data: JSON.stringify({ reason: 'user_initiated' })
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/logout',
        expect.objectContaining({
          keepalive: true
        })
      )
    })
  })

  describe('status codes', () => {
    it('should succeed with 200 OK', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).resolves.toBeUndefined()
    })

    it('should succeed with 201 Created', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'Created' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).resolves.toBeUndefined()
    })

    it('should succeed with 204 No Content', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: true, statusText: 'No Content' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).resolves.toBeUndefined()
    })

    it('should fail with 400 Bad Request', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Bad Request' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Bad Request')
    })

    it('should fail with 401 Unauthorized', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Unauthorized' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Unauthorized')
    })

    it('should fail with 403 Forbidden', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Forbidden' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Forbidden')
    })

    it('should fail with 404 Not Found', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Not Found')
    })

    it('should fail with 500 Internal Server Error', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Internal Server Error')
    })

    it('should fail with 503 Service Unavailable', async () => {
      const mockRequest = createMockAxiosRequest()
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Service Unavailable'
      })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await expect(dispatcher()).rejects.toThrow('Service Unavailable')
    })
  })

  describe('headers handling', () => {
    it('should pass Content-Type header', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/test',
        headers: {
          'Content-Type': 'application/json'
        } as InternalAxiosRequestConfig['headers']
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should pass Authorization header', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/protected',
        headers: {
          Authorization: 'Bearer secret-token'
        } as InternalAxiosRequestConfig['headers']
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer secret-token'
          })
        })
      )
    })

    it('should pass custom headers', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/custom',
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Request-Id': 'req-123'
        } as unknown as InternalAxiosRequestConfig['headers']
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/custom',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'X-Request-Id': 'req-123'
          })
        })
      )
    })

    it('should handle empty headers', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/no-headers',
        headers: {} as InternalAxiosRequestConfig['headers']
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('data types', () => {
    it('should handle string data', async () => {
      const mockRequest = createMockAxiosRequest({
        url: '/api/string',
        data: 'plain text data'
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/string',
        expect.objectContaining({ body: 'plain text data' })
      )
    })

    it('should handle JSON string data', async () => {
      const jsonData = JSON.stringify({ key: 'value', nested: { a: 1 } })
      const mockRequest = createMockAxiosRequest({
        url: '/api/json',
        data: jsonData
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/json',
        expect.objectContaining({ body: jsonData })
      )
    })

    it('should handle URLSearchParams data', async () => {
      const params = new URLSearchParams()
      params.append('key1', 'value1')
      params.append('key2', 'value2')

      const mockRequest = createMockAxiosRequest({
        url: '/api/form',
        data: params
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/form',
        expect.objectContaining({ body: params })
      )
    })

    it('should handle Blob data', async () => {
      const blob = new Blob(['blob content'], { type: 'text/plain' })

      const mockRequest = createMockAxiosRequest({
        url: '/api/blob',
        data: blob
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blob',
        expect.objectContaining({ body: blob })
      )
    })

    it('should handle ArrayBuffer data', async () => {
      const buffer = new ArrayBuffer(8)

      const mockRequest = createMockAxiosRequest({
        url: '/api/buffer',
        data: buffer
      })
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      const dispatcher = await createBeaconDispatcher(mockRequest)
      await dispatcher()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/buffer',
        expect.objectContaining({ body: buffer })
      )
    })
  })
})
