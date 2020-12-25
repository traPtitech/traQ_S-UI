import {
  onUserIconUpdated,
  onUserWebRTCStateChanged,
  onUserUpdated
} from './user'
import { onChannelStared, onChannelUnstared } from './channel'
import { onMessageCreated, onMessageRead } from './message'

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
    case 'USER_UPDATED':
      onUserUpdated(body)
      break
    case 'USER_ICON_UPDATED':
      onUserIconUpdated(body)
      break
    case 'USER_WEBRTC_STATE_CHANGED':
      onUserWebRTCStateChanged(body)
      break
    case 'CHANNEL_STARED':
      onChannelStared(body)
      break
    case 'CHANNEL_UNSTARED':
      onChannelUnstared(body)
      break
    case 'MESSAGE_CREATED':
      onMessageCreated(body)
      break
    case 'MESSAGE_READ':
      onMessageRead(body)
      break
  }
}
