import '/@/lib/websocket'

const { mockPing } = vi.hoisted(() => ({
  mockPing: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({
  WEBSOCKET_ENDPOINT: '/api/v3/ws'
}))

vi.mock('/@/lib/websocket/AutoReconnectWebSocket', () => ({
  default: class {
    ping = mockPing
    addEventListener = vi.fn()
  }
}))

describe('websocket visibility handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pings when the page becomes visible', () => {
    const visibilityState = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden')

    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockPing).not.toHaveBeenCalled()

    visibilityState.mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockPing).toHaveBeenCalledOnce()
  })
})
