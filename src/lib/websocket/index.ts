import { WEBSOCKET_ENDPOINT } from '@/lib/apis'
import { onReceive } from './receive'

const absoluteWebsocketEndpoint = new URL(WEBSOCKET_ENDPOINT, document.baseURI)
absoluteWebsocketEndpoint.protocol =
  window.location.protocol === 'https:' ? 'wss' : 'ws'

export let ws: WebSocket | undefined
export let wsConnectionPromise: Promise<void> | undefined

export const setupWebSocket = () => {
  ws = new WebSocket(absoluteWebsocketEndpoint.href)
  wsConnectionPromise = new Promise(resolve => {
    ws!.addEventListener('open', () => {
      resolve()
    })
  })
  ws.addEventListener('message', event => {
    onReceive(event.data)
  })
}

export * from './send'
