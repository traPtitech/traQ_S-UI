import { WEBSOCKET_ENDPOINT } from '/@/lib/apis'
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

/*
 * デバッグ用
 *
 * Chromeのdev toolsでwebsocketを切れないため。
 * 1. Networkタブから`offline`にする
 * 2. `closeWs()`をconsoleで実行
 * 3. オフライン時にやりたいことをする
 * 4. Networkタブから`online`に戻す
 * 5. `reconnectWs()`をconsoleで実行
 */
if (import.meta.env.MODE === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).closeWs = () => {
    ws.mockFail = true
    ws._ws?.close()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).reconnectWs = () => {
    ws.mockFail = false
    ws.connect()
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    ws.connect()
  }
})

export const wsListener = createWebSocketListener(ws)

export const setupWebSocket = async () => {
  await ws.connect()
}

export * from './send'
