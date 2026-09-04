import AutoReconnectWebSocket from '/@/lib/websocket/AutoReconnectWebSocket'

class MockWebSocket extends EventTarget {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 3
  static instances: MockWebSocket[] = []

  readyState = MockWebSocket.CONNECTING
  sent: string[] = []
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
    this.dispatchEvent(new Event('close'))
  })

  constructor(
    readonly url: string,
    readonly protocols?: string | string[]
  ) {
    super()
    MockWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  open() {
    this.readyState = MockWebSocket.OPEN
    this.dispatchEvent(new Event('open'))
  }

  receive(data: string) {
    this.dispatchEvent(new MessageEvent('message', { data }))
  }
}

describe('AutoReconnectWebSocket heartbeat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const connect = async () => {
    const ws = new AutoReconnectWebSocket('ws://example.com', undefined, {
      maxReconnectionDelay: 1,
      minReconnectionDelay: 1,
      pingInterval: 1000,
      pingTimeout: 100
    })
    const connected = ws.connect()
    const socket = MockWebSocket.instances[0]
    if (!socket) throw new Error('WebSocket was not created')
    socket.open()
    await connected
    return { socket, ws }
  }

  it('keeps the connection when the server answers ping', async () => {
    const { socket, ws } = await connect()

    ws.ping()
    expect(socket.sent).toEqual(['ping'])

    socket.receive('{"type":"PING","body":null}')
    await vi.advanceTimersByTimeAsync(100)

    expect(socket.close).not.toHaveBeenCalled()
  })

  it('reconnects when the server does not answer ping', async () => {
    const { socket } = await connect()

    await vi.advanceTimersByTimeAsync(1101)

    expect(socket.close).toHaveBeenCalledOnce()
    expect(MockWebSocket.instances).toHaveLength(2)
  })

  it('uses the minimum delay for the first reconnect', async () => {
    const ws = new AutoReconnectWebSocket('ws://example.com', undefined, {
      maxReconnectionDelay: 1000,
      minReconnectionDelay: 100,
      pingInterval: 1000,
      pingTimeout: 100
    })
    const connected = ws.connect()
    const socket = MockWebSocket.instances[0]
    if (!socket) throw new Error('WebSocket was not created')
    socket.open()
    await connected

    socket.close()
    await vi.advanceTimersByTimeAsync(99)
    expect(MockWebSocket.instances).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(MockWebSocket.instances).toHaveLength(2)
  })

  it('does not postpone the timeout when ping interval is shorter', async () => {
    const ws = new AutoReconnectWebSocket('ws://example.com', undefined, {
      maxReconnectionDelay: 1,
      minReconnectionDelay: 1,
      pingInterval: 100,
      pingTimeout: 250
    })
    const connected = ws.connect()
    const socket = MockWebSocket.instances[0]
    if (!socket) throw new Error('WebSocket was not created')
    socket.open()
    await connected

    await vi.advanceTimersByTimeAsync(349)
    expect(socket.sent).toEqual(['ping'])
    expect(socket.close).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(socket.close).toHaveBeenCalledOnce()
  })

  it('ignores messages from a replaced socket', async () => {
    const { socket, ws } = await connect()
    const listener = vi.fn()
    ws.addEventListener('message', listener)

    socket.close()
    await vi.advanceTimersByTimeAsync(2)
    expect(MockWebSocket.instances).toHaveLength(2)

    socket.receive('{"type":"PING","body":null}')
    expect(listener).not.toHaveBeenCalled()
  })

  it('does not start another connection while reconnecting', async () => {
    const { socket, ws } = await connect()

    socket.close()
    await expect(ws.connect()).resolves.toBeUndefined()
    expect(MockWebSocket.instances).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(2)
    expect(MockWebSocket.instances).toHaveLength(2)
  })

  it('continues reconnecting when a connecting socket closes', async () => {
    const { socket, ws } = await connect()

    socket.close()
    await vi.advanceTimersByTimeAsync(2)
    expect(MockWebSocket.instances).toHaveLength(2)

    ws.closeForDebug()
    ws.reconnectForDebug()
    await vi.advanceTimersByTimeAsync(2)
    expect(MockWebSocket.instances).toHaveLength(3)
  })

  it('retries when a connection attempt times out', async () => {
    const ws = new AutoReconnectWebSocket('ws://example.com', undefined, {
      connectionTimeout: 100,
      maxReconnectionDelay: 1,
      minReconnectionDelay: 1
    })
    const connected = ws.connect()
    const socket = MockWebSocket.instances[0]
    if (!socket) throw new Error('WebSocket was not created')
    socket.open()
    await connected

    socket.close()
    await vi.advanceTimersByTimeAsync(1)
    const stalledSocket = MockWebSocket.instances[1]
    if (!stalledSocket) throw new Error('WebSocket was not created')

    await vi.advanceTimersByTimeAsync(100)
    expect(stalledSocket.close).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1)
    expect(MockWebSocket.instances).toHaveLength(3)
  })
})
