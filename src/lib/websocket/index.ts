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
    ws.closeForDebug()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).reconnectWs = () => {
    ws.mockFail = false
    ws.connect()
  }
}

// バックグラウンドから復帰した際、WebSocketのreadyStateはOPENのままなのに
// 実際にはネットワークが切断されている（closeイベントが発火しない）ことが
// あり、隠れていた時間の長さでは生死を判断できない。そのため時間で推測せず、
// 復帰の度にforceReconnect()で実際に接続を張り直して検証する
// （生きている接続だった場合も即座に張り直されるだけで実害はない）
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    ws.forceReconnect()
  }
})

export const wsListener = createWebSocketListener(ws)

export const setupWebSocket = async () => {
  await ws.connect()
}

export * from './send'
