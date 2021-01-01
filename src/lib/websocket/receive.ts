import { onMessageCreated } from './message'

import { WebSocketEvent } from './events'

export const onReceive = <T extends keyof WebSocketEvent>(event: {
  type: T
  body: WebSocketEvent[T]
}) => {
  if (event.type === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[WebSocket] Invalid Event Received: ${event}`)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = event.body as any

  switch (event.type) {
    case 'MESSAGE_CREATED':
      onMessageCreated(body)
      break
  }
}
