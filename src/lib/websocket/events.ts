import {
  UserId,
  ChannelId,
  UserGroupId,
  MessageId,
  StampId,
  ClipFolderId,
  StampPaletteId
} from '@/types/entity-ids'
import { ChannelViewState, Pin, ChannelViewer } from '@traptitech/traq'

export type WebSocketEvent =
  | UserEvent
  | ChannelEvent
  | MessageEvent
  | StampEvent
  | ClipFolderEvent

/*
 * User
 */
type UserEvent =
  | UserJoinedEvent
  | UserUpdatedEvent
  | UserLeftEvent
  | UserTagsUpdatedEvent
  | UserIconUpdatedEvent
  | UserOnlineEvent
  | UserOfflineEvent
  | UserWebRTCStateChangedEvent
  | UserGroupCreatedEvent
  | UserGroupUpdatedEvent
  | UserGroupDeletedEvent

interface UserIdBody {
  id: UserId
}

interface UserGroupIdBody {
  id: UserGroupId
}

export interface UserJoinedEvent {
  type: 'USER_JOINED'
  body: UserIdBody
}

export interface UserUpdatedEvent {
  type: 'USER_UPDATED'
  body: UserIdBody
}

export interface UserLeftEvent {
  type: 'USER_LEFT'
  body: UserIdBody
}

export interface UserTagsUpdatedEvent {
  type: 'USER_TAGS_UPDATED'
  body: UserIdBody
}

export interface UserIconUpdatedEvent {
  type: 'USER_ICON_UPDATED'
  body: UserIdBody
}

export interface UserOnlineEvent {
  type: 'USER_ONLINE'
  body: UserIdBody
}

export interface UserOfflineEvent {
  type: 'USER_OFFLINE'
  body: UserIdBody
}

export interface UserWebRTCStateChangedEvent {
  type: 'USER_WEBRTC_STATE_CHANGED'
  body: {
    user_id: UserId
    channel_id: ChannelId
    state: string // TODO: もっと厳密にする
  }
}

export interface UserGroupCreatedEvent {
  type: 'USER_GROUP_CREATED'
  body: UserGroupIdBody
}

export interface UserGroupUpdatedEvent {
  type: 'USER_GROUP_UPDATED'
  body: UserGroupIdBody
}

export interface UserGroupDeletedEvent {
  type: 'USER_GROUP_DELETED'
  body: UserGroupIdBody
}

/*
 * Channel
 */
type ChannelEvent =
  | ChannelCreatedEvent
  | ChannelDeletedEvent
  | ChannelUpdatedEvent
  | ChannelStaredEvent
  | ChannelUnstaredEvent
  | ChannelViewersChangedEvent

interface ChannelIdBody {
  id: ChannelId
}

export interface ChannelCreatedEvent {
  type: 'CHANNEL_CREATED'
  body: ChannelIdBody
}

export interface ChannelDeletedEvent {
  type: 'CHANNEL_DELETED'
  body: ChannelIdBody
}

export interface ChannelUpdatedEvent {
  type: 'CHANNEL_UPDATED'
  body: ChannelIdBody
}

export interface ChannelStaredEvent {
  type: 'CHANNEL_STARED'
  body: ChannelIdBody
}

export interface ChannelUnstaredEvent {
  type: 'CHANNEL_UNSTARED'
  body: ChannelIdBody
}

export interface ChannelViewersChangedEvent {
  type: 'CHANNEL_VIEWERS_CHANGED'
  body: {
    id: ChannelId
    viewers: ChannelViewer[]
  }
}

/*
 * Message
 */
type MessageEvent =
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | MessageReadEvent
  | MessageStampedEvent
  | MessageUnstampedEvent
  | MessagePinnedEvent
  | MessageUnpinnedEvent

interface MessageIdBody {
  id: MessageId
}

interface PinBody {
  message_id: MessageId
  channel_id: ChannelId
}

export interface MessageCreatedEvent {
  type: 'MESSAGE_CREATED'
  body: MessageIdBody
}

export interface MessageUpdatedEvent {
  type: 'MESSAGE_UPDATED'
  body: MessageIdBody
}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED'
  body: MessageIdBody
}

export interface MessageReadEvent {
  type: 'MESSAGE_READ'
  body: MessageIdBody
}

export interface MessageStampedEvent {
  type: 'MESSAGE_STAMPED'
  body: {
    message_id: MessageId
    user_id: UserId
    stamp_id: StampId
    count: number
    created_at: string
  }
}

export interface MessageUnstampedEvent {
  type: 'MESSAGE_UNSTAMPED'
  body: {
    message_id: MessageId
    user_id: UserId
    stamp_id: StampId
  }
}

export interface MessagePinnedEvent {
  type: 'MESSAGE_PINNED'
  body: PinBody
}

export interface MessageUnpinnedEvent {
  type: 'MESSAGE_UNPINNED'
  body: PinBody
}

/*
 * Stamp
 */
type StampEvent =
  | StampCreatedEvent
  | StampUpdatedEvent
  | StampDeletedEvent
  | StampPaletteCreatedEvent
  | StampPaletteUpdatedEvent
  | StampPaletteDeletedEvent

interface StampIdBody {
  id: StampId
}

interface StampPaletteIdBody {
  id: StampPaletteId
}

export interface StampCreatedEvent {
  type: 'STAMP_CREATED'
  body: StampIdBody
}

export interface StampUpdatedEvent {
  type: 'STAMP_UPDATED'
  body: StampIdBody
}

export interface StampDeletedEvent {
  type: 'STAMP_DELETED'
  body: StampIdBody
}

export interface StampPaletteCreatedEvent {
  type: 'STAMP_PALETTE_CREATED'
  body: StampPaletteIdBody
}

export interface StampPaletteUpdatedEvent {
  type: 'STAMP_PALETTE_UPDATED'
  body: StampPaletteIdBody
}

export interface StampPaletteDeletedEvent {
  type: 'STAMP_PALETTE_DELETED'
  body: StampPaletteIdBody
}

/*
 * Clip Folder
 */
type ClipFolderEvent =
  | ClipFolderCreatedEvent
  | ClipFolderUpdatedEvent
  | ClipFolderDeletedEvent
  | ClipFolderMessageAddedEvent
  | ClipFolderMessageDeletedEvent

interface ClipFolderIdBody {
  id: ClipFolderId
}

interface ClipFolderIdAndMessageIdBody {
  folder_id: ClipFolderId
  message_id: MessageId
}

export interface ClipFolderCreatedEvent {
  type: 'CLIP_FOLDER_CREATED'
  body: ClipFolderIdBody
}

export interface ClipFolderUpdatedEvent {
  type: 'CLIP_FOLDER_UPDATED'
  body: ClipFolderIdBody
}
export interface ClipFolderDeletedEvent {
  type: 'CLIP_FOLDER_DELETED'
  body: ClipFolderIdBody
}

export interface ClipFolderMessageAddedEvent {
  type: 'CLIP_FOLDER_MESSAGE_ADDED'
  body: ClipFolderIdAndMessageIdBody
}

export interface ClipFolderMessageDeletedEvent {
  type: 'CLIP_FOLDER_MESSAGE_DELETED'
  body: ClipFolderIdAndMessageIdBody
}
