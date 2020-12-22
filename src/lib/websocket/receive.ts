import {
  onUserTagsUpdated,
  onUserIconUpdated,
  onUserWebRTCStateChanged,
  onUserUpdated
} from './user'
import {
  onChannelCreated,
  onChannelUpdated,
  onChannelStared,
  onChannelUnstared,
  onChannelViewersChanged,
  onChannelSubscribersChanged
} from './channel'
import {
  onMessageCreated,
  onMessageUpdated,
  onMessageDeleted,
  onMessageRead,
  onMessagePinned,
  onMessageUnpinned
} from './message'
import { onClipFolderMessageDeleted } from './clipFolder'

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
    case 'USER_TAGS_UPDATED':
      onUserTagsUpdated(body)
      break
    case 'USER_ICON_UPDATED':
      onUserIconUpdated(body)
      break
    case 'USER_WEBRTC_STATE_CHANGED':
      onUserWebRTCStateChanged(body)
      break
    case 'CHANNEL_CREATED':
      onChannelCreated(body)
      break
    case 'CHANNEL_UPDATED':
      onChannelUpdated(body)
      break
    case 'CHANNEL_STARED':
      onChannelStared(body)
      break
    case 'CHANNEL_UNSTARED':
      onChannelUnstared(body)
      break
    case 'CHANNEL_VIEWERS_CHANGED':
      onChannelViewersChanged(body)
      break
    case 'CHANNEL_SUBSCRIBERS_CHANGED':
      onChannelSubscribersChanged(body)
      break
    case 'MESSAGE_CREATED':
      onMessageCreated(body)
      break
    case 'MESSAGE_UPDATED':
      onMessageUpdated(body)
      break
    case 'MESSAGE_DELETED':
      onMessageDeleted(body)
      break
    case 'MESSAGE_READ':
      onMessageRead(body)
      break
    case 'MESSAGE_PINNED':
      onMessagePinned(body)
      break
    case 'MESSAGE_UNPINNED':
      onMessageUnpinned(body)
      break
    case 'CLIP_FOLDER_MESSAGE_DELETED':
      onClipFolderMessageDeleted(body)
      break
  }
}
