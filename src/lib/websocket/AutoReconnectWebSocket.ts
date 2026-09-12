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
  private socket?: WebSocket
  private heartbeatInterval?: ReturnType<typeof setInterval>
  private heartbeatTimeout?: ReturnType<typeof setTimeout>
  private readonly eventTarget = new EventTarget()

  private readonly url: string
  private readonly protocols: string | string[] | undefined
  private readonly options: Readonly<Options>

  private readonly sendQueue = new Map<WebSocketCommand, readonly string[]>()
  private isInitialized = false
  private reconnecting = false

  private mockFail = false

  constructor(
    url: string,
    protocols: string | string[] | undefined,
    options: Readonly<Partial<Options>>
  ) {
    this.url = url
    this.protocols = protocols
    this.options = { ...defaultOptions, ...options }
  }

  private get isOpen() {
    return this.socket?.readyState === WebSocket.OPEN
  }
  private get isOpenOrConnecting() {
    return (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    )
  }

  private sendImmediately(commands: readonly [WebSocketCommand, ...string[]]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.socket!.send(commands.join(':'))
  }

  sendCommand(...commands: readonly [WebSocketCommand, ...string[]]) {
    this.sendQueue.set(commands[0], commands.slice(1))
    if (this.isOpen) {
      this.sendImmediately(commands)
    }
  }

  ping() {
    const socket = this.socket
    if (
      socket?.readyState !== WebSocket.OPEN ||
      this.heartbeatTimeout !== undefined
    )
      return

    socket.send('ping')
    this.heartbeatTimeout = setTimeout(() => {
      if (this.socket !== socket) return

      this.stopHeartbeat()
      socket.close()
      this.reconnect()
    }, this.options.pingTimeout)
  }

  private getReconnectDelay(count: number) {
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

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(
      () => this.ping(),
      this.options.pingInterval
    )
  }

  private setupSocket() {
    return new Promise<void>(resolve => {
      const socket = new WebSocket(this.url, this.protocols)
      this.socket = socket
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
          if (this.socket !== socket) {
            socket.close()
            return
          }

          if (this.isInitialized) {
            this.eventTarget.dispatchEvent(new Event('reconnect'))
          } else {
            this.isInitialized = true
          }

          this.sendQueue.forEach((args, command) => {
            this.sendImmediately([command, ...args])
          })
          this.startHeartbeat()
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
        if (this.socket !== socket) return

        this.clearHeartbeatTimeout()
        this.eventTarget.dispatchEvent(
          new CustomEvent('message', { detail: e.data })
        )
      })

      socket.addEventListener(
        'close',
        () => {
          finish()
          if (this.socket !== socket) return

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

    return this.setupSocket()
  }

  private async reconnect() {
    if (this.reconnecting) return
    this.reconnecting = true

    let count = 0
    while (!this.isOpen) {
      const delay = this.getReconnectDelay(count)
      count++
      await wait(delay)

      if (this.isOpen) break

      if (!this.mockFail) {
        await this.setupSocket()
      }
    }

    this.reconnecting = false
  }

  closeForDebug() {
    this.mockFail = true
    this.socket?.close()
  }

  reconnectForDebug() {
    this.mockFail = false
    this.connect()
  }
}
