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
  onUserGroupDeleted
} from './user'
import {
  onChannelCreated,
  onChannelDeleted,
  onChannelUpdated,
  onChannelStared,
  onChannelUnstared,
  onChannelViewersChanged
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

export const onReceive = (data: string) => {
  const event = JSON.parse(data) as WebSocketEvent

  if (event.type === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[WebSocket] Invalid Event Received: ${data}`)
    return
  }

  switch (event.type) {
    case 'USER_JOINED':
      onUserJoined(event.body)
      break
    case 'USER_LEFT':
      onUserLeft(event.body)
      break
    case 'USER_TAGS_UPDATED':
      onUserTagsUpdated(event.body)
      break
    case 'USER_ICON_UPDATED':
      onUserIconUpdated(event.body)
      break
    case 'USER_ONLINE':
      onUserOnline(event.body)
      break
    case 'USER_OFFLINE':
      onUserOffline(event.body)
      break
    case 'USER_WEBRTC_STATE_CHANGED':
      onUserWebRTCStateChanged(event.body)
      break
    case 'USER_GROUP_CREATED':
      onUserGroupCreated(event.body)
      break
    case 'USER_GROUP_UPDATED':
      onUserGroupUpdated(event.body)
      break
    case 'USER_GROUP_DELETED':
      onUserGroupDeleted(event.body)
      break
    case 'CHANNEL_CREATED':
      onChannelCreated(event.body)
      break
    case 'CHANNEL_DELETED':
      onChannelDeleted(event.body)
      break
    case 'CHANNEL_UPDATED':
      onChannelUpdated(event.body)
      break
    case 'CHANNEL_STARED':
      onChannelStared(event.body)
      break
    case 'CHANNEL_UNSTARED':
      onChannelUnstared(event.body)
      break
    case 'CHANNEL_VIEWERS_CHANGED':
      onChannelViewersChanged(event.body)
      break
    case 'MESSAGE_CREATED':
      onMessageCreated(event.body)
      break
    case 'MESSAGE_UPDATED':
      onMessageUpdated(event.body)
      break
    case 'MESSAGE_DELETED':
      onMessageDeleted(event.body)
      break
    case 'MESSAGE_READ':
      onMessageRead(event.body)
      break
    case 'MESSAGE_STAMPED':
      onMessageStamped(event.body)
      break
    case 'MESSAGE_UNSTAMPED':
      onMessageUnstamped(event.body)
      break
    case 'MESSAGE_PINNED':
      onMessagePinned(event.body)
      break
    case 'MESSAGE_UNPINNED':
      onMessageUnpinned(event.body)
      break
    case 'STAMP_CREATED':
      onStampCreated(event.body)
      break
    case 'STAMP_UPDATED':
      onStampUpdated(event.body)
      break
    case 'STAMP_DELETED':
      onStampDeleted(event.body)
      break
    case 'STAMP_PALETTE_CREATED':
      onStampPaletteCreated(event.body)
      break
    case 'STAMP_PALETTE_UPDATED':
      onStampPaletteUpdated(event.body)
      break
    case 'STAMP_PALETTE_DELETED':
      onStampPaletteDeleted(event.body)
      break
    case 'CLIP_FOLDER_CREATED':
      onClipFolderCreated(event.body)
      break
    case 'CLIP_FOLDER_UPDATED':
      onClipFolderUpdated(event.body)
      break
    case 'CLIP_FOLDER_DELETED':
      onClipFolderDeleted(event.body)
      break
    case 'CLIP_FOLDER_MESSAGE_ADDED':
      onClipFolderMessageAdded(event.body)
      break
    case 'CLIP_FOLDER_MESSAGE_DELETED':
      onClipFolderMessageDeleted(event.body)
      break
    default:
      const strangeValue: never = event
      // eslint-disable-next-line no-console
      console.warn(`[WebSocket] Unknown event: `, strangeValue)
  }
}
