import AutoReconnectWebSocket from './AutoReconnectWebSocket'
import { mitt, TypedMitt } from '@/lib/typedMitt'
import { WebSocketEvent } from './events'

type WebSocketListenerEventMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all: (event: { type: keyof WebSocketEvent; body: WebSocketEvent }) => any
} & {
  [Type in keyof WebSocketEvent]: (
    payload: WebSocketEvent[Type]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any
}

export const createWebSocketListener = (ws: AutoReconnectWebSocket) => {
  const listener = mitt<WebSocketListenerEventMap>()

  ws.addEventListener('message', event => {
    try {
      const wsEvent: {
        type: keyof WebSocketEvent
        body: WebSocketEvent
      } = JSON.parse(event.detail as string)

      listener.emit('all', wsEvent)
      listener.emit(
        wsEvent.type,
        (wsEvent.body as unknown) as WebSocketEvent[typeof wsEvent.type]
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[WebSocket] Failed to parse: ', e)
    }
  })

  // 外でemitできないようにOmitする
  return listener as Omit<TypedMitt<WebSocketListenerEventMap>, 'emit'>
}
