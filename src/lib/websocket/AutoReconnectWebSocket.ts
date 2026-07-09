import { wait } from '/@/lib/basic/timer'

import type { WebSocketCommand } from '.'

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
  private socket?: WebSocket
  private reconnectWaitAbortController?: AbortController

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
    return this.socket?.readyState === WebSocket.OPEN
  }
  get isOpenOrConnecting() {
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

  private getReconnectDelay(count: number) {
    const { minReconnectionDelay, maxReconnectionDelay } = this.options
    return Math.min(minReconnectionDelay * 1.3 ** count, maxReconnectionDelay)
  }

  private setupSocket() {
    return new Promise<void>(resolve => {
      this.socket = new WebSocket(this.url, this.protocols)

      this.socket.addEventListener(
        'open',
        () => {
          resolve()
          if (this.isInitialized) {
            this.eventTarget.dispatchEvent(new Event('reconnect'))
          } else {
            this.isInitialized = true
          }

          this.sendQueue.forEach((args, command) => {
            this.sendImmediately([command, ...args])
          })
        },
        { once: true }
      )
      this.socket.addEventListener(
        'error',
        () => {
          resolve()
        },
        { once: true }
      )

      this.socket.addEventListener('message', e => {
        this.eventTarget.dispatchEvent(
          new CustomEvent('message', { detail: e.data })
        )
      })

      this.socket.addEventListener(
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

  private abortReconnectWaitIfAny() {
    if (!this.reconnecting) return false

    this.reconnectWaitAbortController?.abort()
    return true
  }

  async connect() {
    if (this.isOpenOrConnecting) return
    if (this.abortReconnectWaitIfAny()) return

    return this.setupSocket()
  }

  // readyStateがOPENのまま実際にはネットワーク的に切断されている
  // （closeイベントが発火しない）ケースがあるため、readyStateを信用せず
  // 強制的に閉じて生死を検証する。closeイベント経由の通常のreconnect()を
  // 待たずにここでreconnect({ immediate: true })を呼んで自らreconnectingを
  // 確保することで、後から発火するcloseイベントが二重に再接続ループを
  // 開始するのを防ぐ
  forceReconnect() {
    if (this.abortReconnectWaitIfAny()) return

    if (!this.socket) {
      this.connect()
      return
    }

    this.socket.close()
    this.reconnect({ immediate: true })
  }

  async reconnect({ immediate = false } = {}) {
    if (this.reconnecting) return
    this.reconnecting = true

    let count = 0
    while (!this.isOpen) {
      if (!(immediate && count === 0)) {
        this.reconnectWaitAbortController = new AbortController()
        await wait(
          this.getReconnectDelay(count),
          this.reconnectWaitAbortController.signal
        )
        this.reconnectWaitAbortController = undefined
      }
      count++

      if (this.isOpen) break

      if (!this.mockFail) {
        await this.setupSocket()
      }
    }

    this.reconnecting = false
  }

  closeForDebug() {
    this.socket?.close()
  }
}
