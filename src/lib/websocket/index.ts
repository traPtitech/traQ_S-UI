import { WEBSOCKET_ENDPOINT } from '@/lib/apis'
import { onReceive } from './receive'
import AutoReconnectWebSocket from './AutoReconnectWebSocket'
import { createWebSocketListener } from './WebSocketListener'

const absoluteWebsocketEndpoint = new URL(WEBSOCKET_ENDPOINT, document.baseURI)
absoluteWebsocketEndpoint.protocol =
  window.location.protocol === 'https:' ? 'wss' : 'ws'

export const ws = new AutoReconnectWebSocket(
  absoluteWebsocketEndpoint.href,
  undefined,
  {
    maxReconnectionDelay: 3000,
    minReconnectionDelay: 1000
  }
)

export const wsListener = createWebSocketListener(ws)
wsListener.on('all', event => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReceive(event as any)
})

export const setupWebSocket = () => {
  ws.connect()
}

export * from './send'
