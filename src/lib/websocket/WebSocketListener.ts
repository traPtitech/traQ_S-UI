import AutoReconnectWebSocket from './AutoReconnectWebSocket'
import { mitt, TypedMitt } from '@/lib/typedMitt'

type WebSocketListenerEventMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all: (detail: string) => any
}

export const createWebSocketListener = (ws: AutoReconnectWebSocket) => {
  const listener = mitt<WebSocketListenerEventMap>()

  ws.addEventListener('message', event => {
    listener.emit('all', event.detail as string)
  })

  // 外でemitできないようにOmitする
  return listener as Omit<TypedMitt<WebSocketListenerEventMap>, 'emit'>
}
