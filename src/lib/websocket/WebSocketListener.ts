import type AutoReconnectWebSocket from './AutoReconnectWebSocket'
import type { Emitter } from 'mitt'
import mitt from 'mitt'
import type { WebSocketEvent } from './events'

type WebSocketListenerEventMap = {
  [Type in keyof WebSocketEvent]: WebSocketEvent[Type]
} & {
  reconnect: void
}

export const createWebSocketListener = (ws: AutoReconnectWebSocket) => {
  const listener = mitt<WebSocketListenerEventMap>()

  ws.addEventListener('message', event => {
    try {
      const wsEvent: {
        type: keyof WebSocketEvent
        body: WebSocketEvent[keyof WebSocketEvent]
      } = JSON.parse(event.detail as string)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener.emit(wsEvent.type as any, wsEvent.body)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[WebSocket] Failed to parse: ', e)
    }
  })
  ws.addEventListener('reconnect', () => {
    listener.emit('reconnect')
  })

  // 外でemitできないようにOmitする
  return listener as Omit<Emitter<WebSocketListenerEventMap>, 'emit'>
}
