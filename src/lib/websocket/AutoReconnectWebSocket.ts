import { wait } from '/@/lib/basic/timer'

import type { WebSocketCommand } from '.'

export interface Options {
  maxReconnectionDelay: number
  minReconnectionDelay: number
  connectionTimeout: number
  pingInterval: number
  pingTimeout: number
}

const defaultOptions: Options = {
  maxReconnectionDelay: 10000,
  minReconnectionDelay: 1000,
  connectionTimeout: 4000,
  pingInterval: 30000,
  pingTimeout: 10000
}

interface EventMap {
  message: CustomEvent<unknown>
  reconnect: Event
}
type TypedEventListener<T extends keyof EventMap> = (ev: EventMap[T]) => void

export default class AutoReconnectWebSocket {
  _ws?: WebSocket
  private heartbeatInterval?: ReturnType<typeof setInterval>
  private heartbeatTimeout?: ReturnType<typeof setTimeout>
  readonly eventTarget = new EventTarget()

  readonly url: string
  readonly protocols: string | string[] | undefined
  readonly options: Readonly<Options>

  sendQueue = new Map<WebSocketCommand, readonly string[]>()
  isInitialized = false
  reconnecting = false

  mockFail = false

  constructor(
    url: string,
    protocols: string | string[] | undefined,
    options: Readonly<Partial<Options>>
  ) {
    this.url = url
    this.protocols = protocols
    this.options = { ...defaultOptions, ...options }
  }

  get isOpen() {
    return this._ws?.readyState === WebSocket.OPEN
  }
  get isOpenOrConnecting() {
    return (
      this._ws?.readyState === WebSocket.OPEN ||
      this._ws?.readyState === WebSocket.CONNECTING
    )
  }

  _sendCommand(commands: readonly [WebSocketCommand, ...string[]]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._ws!.send(commands.join(':'))
  }

  sendCommand(...commands: readonly [WebSocketCommand, ...string[]]) {
    this.sendQueue.set(commands[0], commands.slice(1))
    if (this.isOpen) {
      this._sendCommand(commands)
    }
  }

  _getDelay(count: number) {
    const { minReconnectionDelay, maxReconnectionDelay } = this.options
    return Math.min(minReconnectionDelay * 1.3 ** count, maxReconnectionDelay)
  }

  private clearHeartbeatTimeout() {
    clearTimeout(this.heartbeatTimeout)
    this.heartbeatTimeout = undefined
  }

  private stopHeartbeat() {
    clearInterval(this.heartbeatInterval)
    this.heartbeatInterval = undefined
    this.clearHeartbeatTimeout()
  }

  private startHeartbeat(socket: WebSocket) {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (
        socket.readyState !== WebSocket.OPEN ||
        this.heartbeatTimeout !== undefined
      )
        return

      socket.send('ping')
      this.heartbeatTimeout = setTimeout(() => {
        if (this._ws !== socket) return

        this.stopHeartbeat()
        socket.close()
        this.reconnect()
      }, this.options.pingTimeout)
    }, this.options.pingInterval)
  }

  _setupWs() {
    return new Promise<void>(resolve => {
      const socket = new WebSocket(this.url, this.protocols)
      this._ws = socket
      const finish = () => {
        clearTimeout(connectionTimeout)
        resolve()
      }
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.CONNECTING) return

        socket.close()
        finish()
      }, this.options.connectionTimeout)

      socket.addEventListener(
        'open',
        () => {
          finish()
          if (this._ws !== socket) {
            socket.close()
            return
          }

          if (this.isInitialized) {
            this.eventTarget.dispatchEvent(new Event('reconnect'))
          } else {
            this.isInitialized = true
          }

          this.sendQueue.forEach((args, command) => {
            this._sendCommand([command, ...args])
          })
          this.startHeartbeat(socket)
        },
        { once: true }
      )
      socket.addEventListener(
        'error',
        () => {
          finish()
        },
        { once: true }
      )

      socket.addEventListener('message', e => {
        if (this._ws !== socket) return

        this.clearHeartbeatTimeout()
        this.eventTarget.dispatchEvent(
          new CustomEvent('message', { detail: e.data })
        )
      })

      socket.addEventListener(
        'close',
        () => {
          finish()
          if (this._ws !== socket) return

          this.stopHeartbeat()
          this.reconnect()
        },
        { once: true }
      )
    })
  }

  addEventListener<T extends keyof EventMap>(
    type: T,
    listener: TypedEventListener<T>,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.eventTarget.addEventListener(type, listener as EventListener, options)
  }
  removeEventListener<T extends keyof EventMap>(
    type: T,
    listener: TypedEventListener<T>,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.eventTarget.removeEventListener(
      type,
      listener as EventListener,
      options
    )
  }

  async connect() {
    if (this.reconnecting || this.isOpenOrConnecting) return

    return this._setupWs()
  }

  async reconnect() {
    if (this.reconnecting) return
    this.reconnecting = true

    let count = 0
    while (!this.isOpen) {
      count++

      const delay = this._getDelay(count)
      await wait(delay)

      if (this.isOpen) break

      if (!this.mockFail) {
        await this._setupWs()
      }
    }

    this.reconnecting = false
  }
}
