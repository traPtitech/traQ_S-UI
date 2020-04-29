import ReconnectingWebSocket from 'reconnecting-websocket'
import { WEBSOCKET_ENDPOINT } from '@/lib/apis'
import { onReceive } from './receive'

const absoluteWebsocketEndpoint = new URL(WEBSOCKET_ENDPOINT, document.baseURI)
absoluteWebsocketEndpoint.protocol =
  window.location.protocol === 'https:' ? 'wss' : 'ws'

let isOpened: boolean = false

export let ws: ReconnectingWebSocket | undefined
export let wsConnectionPromise: Promise<void> | undefined

export const setupWebSocket = () => {
  ws = new ReconnectingWebSocket(absoluteWebsocketEndpoint.href, [], {
    maxReconnectionDelay: 3000,
    minReconnectionDelay: 1000,
    connectionTimeout: 1000,
    maxEnqueuedMessages: 0
  })
  wsConnectionPromise = new Promise(resolve => {
    const resolver = () => {
      resolve()
      ws!.removeEventListener('open', resolver)
    }
    ws!.addEventListener('open', resolver)
  })
  ws.addEventListener('message', event => {
    onReceive(event.data)
  })
  ws.addEventListener('open', ev => {
    isOpened = true
  })
  ws.addEventListener('close', ev => {
    if (isOpened) {
      isOpened = false
      wsConnectionPromise = new Promise(resolve => {
        const resolver = () => {
          resolve()
          ws!.removeEventListener('open', resolver)
        }
        ws!.addEventListener('open', resolver)
      })
    }
  })
}

export * from './send'
