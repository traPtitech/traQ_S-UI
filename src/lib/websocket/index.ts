import { WEBSOCKET_ENDPOINT } from '@/lib/api'
import { onReceive } from './receive'

const absoluteWebsocketEndpoint = new URL(WEBSOCKET_ENDPOINT, document.baseURI)
absoluteWebsocketEndpoint.protocol =
  window.location.protocol === 'https:' ? 'wss' : 'ws'

export let ws: WebSocket | undefined

export const setupWebSocket = () => {
  ws = new WebSocket(absoluteWebsocketEndpoint.href)
  ws.addEventListener('message', event => {
    onReceive(event.data)
  })
}

export * from './send'
