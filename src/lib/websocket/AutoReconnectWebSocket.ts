import type { WebSocketCommand } from '.'
import { wait } from '/@/lib/basic/timer'

export interface Options {
  maxReconnectionDelay: number
  minReconnectionDelay: number
  connectionTimeout: number
}

const defaultOptions: Options = {
  maxReconnectionDelay: 10000,
  minReconnectionDelay: 1000,
  connectionTimeout: 4000
}

interface EventMap {
  message: CustomEvent<unknown>
  reconnect: Event
}
type TypedEventListener<T extends keyof EventMap> = (ev: EventMap[T]) => void

export default class AutoReconnectWebSocket {
  _ws?: WebSocket
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
    this.options = { ...options, ...defaultOptions }
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

  _setupWs() {
    return new Promise<void>(resolve => {
      this._ws = new WebSocket(this.url, this.protocols)

      this._ws.addEventListener(
        'open',
        () => {
          resolve()
          if (this.isInitialized) {
            this.eventTarget.dispatchEvent(new Event('reconnect'))
          } else {
            this.isInitialized = true
          }

          this.sendQueue.forEach((args, command) => {
            this._sendCommand([command, ...args])
          })
        },
        { once: true }
      )
      this._ws.addEventListener(
        'error',
        () => {
          resolve()
        },
        { once: true }
      )

      this._ws.addEventListener('message', e => {
        this.eventTarget.dispatchEvent(
          new CustomEvent('message', { detail: e.data })
        )
      })

      this._ws.addEventListener(
        'close',
        () => {
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
    if (this.isOpenOrConnecting) return

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
