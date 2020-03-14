import {
  UserId,
  ChannelId,
  UserGroupId,
  MessageId,
  StampId
} from '@/types/entity-ids'

export type WebSocketEvent =
  | UserEvent
  | ChannelEvent
  | MessageEvent
  | StampEvent

/*
 * User
 */
type UserEvent =
  | UserJoinedEvent
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
    viewers: UserId[]
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
  body: MessageIdBody
}

export interface MessageUnpinnedEvent {
  type: 'MESSAGE_UNPINNED'
  body: MessageIdBody
}

/*
 * Stamp
 */
type StampEvent = StampCreatedEvent | StampUpdatedEvent | StampDeletedEvent

interface StampIdBody {
  id: StampId
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
