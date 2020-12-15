import {
  onUserJoined,
  onUserLeft,
  onUserTagsUpdated,
  onUserIconUpdated,
  onUserOnline,
  onUserOffline,
  onUserWebRTCStateChanged,
  onUserGroupCreated,
  onUserGroupUpdated,
  onUserGroupDeleted,
  onUserUpdated
} from './user'
import {
  onChannelCreated,
  onChannelDeleted,
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
  onMessageStamped,
  onMessageUnstamped,
  onMessagePinned,
  onMessageUnpinned
} from './message'
import {
  onClipFolderCreated,
  onClipFolderDeleted,
  onClipFolderUpdated,
  onClipFolderMessageAdded,
  onClipFolderMessageDeleted
} from './clipFolder'
import {
  onStampCreated,
  onStampUpdated,
  onStampDeleted,
  onStampPaletteCreated,
  onStampPaletteUpdated,
  onStampPaletteDeleted
} from './stamp'
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
    case 'USER_JOINED':
      onUserJoined(body)
      break
    case 'USER_UPDATED':
      onUserUpdated(body)
      break
    case 'USER_LEFT':
      onUserLeft(body)
      break
    case 'USER_TAGS_UPDATED':
      onUserTagsUpdated(body)
      break
    case 'USER_ICON_UPDATED':
      onUserIconUpdated(body)
      break
    case 'USER_ONLINE':
      onUserOnline(body)
      break
    case 'USER_OFFLINE':
      onUserOffline(body)
      break
    case 'USER_WEBRTC_STATE_CHANGED':
      onUserWebRTCStateChanged(body)
      break
    case 'USER_GROUP_CREATED':
      onUserGroupCreated(body)
      break
    case 'USER_GROUP_UPDATED':
      onUserGroupUpdated(body)
      break
    case 'USER_GROUP_DELETED':
      onUserGroupDeleted(body)
      break
    case 'CHANNEL_CREATED':
      onChannelCreated(body)
      break
    case 'CHANNEL_DELETED':
      onChannelDeleted(body)
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
    case 'MESSAGE_STAMPED':
      onMessageStamped(body)
      break
    case 'MESSAGE_UNSTAMPED':
      onMessageUnstamped(body)
      break
    case 'MESSAGE_PINNED':
      onMessagePinned(body)
      break
    case 'MESSAGE_UNPINNED':
      onMessageUnpinned(body)
      break
    case 'STAMP_CREATED':
      onStampCreated(body)
      break
    case 'STAMP_UPDATED':
      onStampUpdated(body)
      break
    case 'STAMP_DELETED':
      onStampDeleted(body)
      break
    case 'STAMP_PALETTE_CREATED':
      onStampPaletteCreated(body)
      break
    case 'STAMP_PALETTE_UPDATED':
      onStampPaletteUpdated(body)
      break
    case 'STAMP_PALETTE_DELETED':
      onStampPaletteDeleted(body)
      break
    case 'CLIP_FOLDER_CREATED':
      onClipFolderCreated(body)
      break
    case 'CLIP_FOLDER_UPDATED':
      onClipFolderUpdated(body)
      break
    case 'CLIP_FOLDER_DELETED':
      onClipFolderDeleted(body)
      break
    case 'CLIP_FOLDER_MESSAGE_ADDED':
      onClipFolderMessageAdded(body)
      break
    case 'CLIP_FOLDER_MESSAGE_DELETED':
      onClipFolderMessageDeleted(body)
      break
  }
}
