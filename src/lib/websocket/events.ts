import type {
  UserId,
  ChannelId,
  UserGroupId,
  MessageId,
  StampId,
  ClipFolderId,
  StampPaletteId,
  TagId
} from '/@/types/entity-ids'
import type {
  ChannelViewer,
  MyChannelViewState,
  QallRoomStateChangedEvent,
  QallSoundboardItemCreatedEvent,
  QallSoundboardItemDeletedEvent
} from '@traptitech/traq'
import type { WebRTCUserStateSessions } from '/@/lib/apis'

export type WebSocketEvent = UserEvent &
  ChannelEvent &
  MessageEvent &
  StampEvent &
  ClipFolderEvent &
  QallEvent

/*
 * User
 */
type UserEvent = {
  USER_JOINED: UserJoinedEvent
  USER_UPDATED: UserUpdatedEvent
  USER_LEFT: UserLeftEvent
  USER_TAGS_UPDATED: UserTagsUpdatedEvent
  USER_ICON_UPDATED: UserIconUpdatedEvent
  USER_ONLINE: UserOnlineEvent
  USER_OFFLINE: UserOfflineEvent
  USER_WEBRTC_STATE_CHANGED: UserWebRTCStateChangedEvent
  USER_VIEWSTATE_CHANGED: UserViewStateChangedEvent
  USER_GROUP_CREATED: UserGroupCreatedEvent
  USER_GROUP_UPDATED: UserGroupUpdatedEvent
  USER_GROUP_DELETED: UserGroupDeletedEvent
}

interface UserIdBody {
  id: UserId
}

interface UserGroupIdBody {
  id: UserGroupId
}

export type UserJoinedEvent = UserIdBody
export type UserUpdatedEvent = UserIdBody
export type UserLeftEvent = UserIdBody

export type UserTagsUpdatedEvent = {
  id: UserId
  tag_id: TagId
}

export type UserIconUpdatedEvent = UserIdBody
export type UserOnlineEvent = UserIdBody
export type UserOfflineEvent = UserIdBody

export type UserWebRTCStateChangedEvent = {
  user_id: UserId
  channel_id: ChannelId
  sessions: WebRTCUserStateSessions[]
}

export type UserViewStateChangedEvent = {
  view_states: MyChannelViewState[]
}

export type UserGroupCreatedEvent = UserGroupIdBody
export type UserGroupUpdatedEvent = UserGroupIdBody
export type UserGroupDeletedEvent = UserGroupIdBody

/*
 * Channel
 */
type ChannelEvent = {
  CHANNEL_CREATED: ChannelCreatedEvent
  CHANNEL_DELETED: ChannelDeletedEvent
  CHANNEL_UPDATED: ChannelUpdatedEvent
  CHANNEL_STARED: ChannelStaredEvent
  CHANNEL_UNSTARED: ChannelUnstaredEvent
  CHANNEL_VIEWERS_CHANGED: ChannelViewersChangedEvent
  CHANNEL_SUBSCRIBERS_CHANGED: ChannelSubscribersChangedEvent
}

interface ChannelIdBody {
  id: ChannelId
}

interface ChannelIdWithMembersBody extends ChannelIdBody {
  dm_user_id?: UserId
}

export type ChannelCreatedEvent = ChannelIdWithMembersBody
export type ChannelDeletedEvent = ChannelIdWithMembersBody
export type ChannelUpdatedEvent = ChannelIdWithMembersBody
export type ChannelStaredEvent = ChannelIdBody
export type ChannelUnstaredEvent = ChannelIdBody

export interface ChannelViewersChangedEvent {
  id: ChannelId
  viewers: ChannelViewer[]
}

export type ChannelSubscribersChangedEvent = ChannelIdBody

/*
 * Message
 */
type MessageEvent = {
  MESSAGE_CREATED: MessageCreatedEvent
  MESSAGE_UPDATED: MessageUpdatedEvent
  MESSAGE_DELETED: MessageDeletedEvent
  MESSAGE_READ: MessageReadEvent
  MESSAGE_STAMPED: MessageStampedEvent
  MESSAGE_UNSTAMPED: MessageUnstampedEvent
  MESSAGE_PINNED: MessagePinnedEvent
  MESSAGE_UNPINNED: MessageUnpinnedEvent
}

type MessageIdBody = {
  id: MessageId
}

type PinBody = {
  message_id: MessageId
  channel_id: ChannelId
}

export type MessageCreatedEvent = {
  id: MessageId
  is_citing: boolean
}
export type MessageUpdatedEvent = MessageIdBody
export type MessageDeletedEvent = MessageIdBody
export type MessageReadEvent = MessageIdBody

export interface MessageStampedEvent {
  message_id: MessageId
  user_id: UserId
  stamp_id: StampId
  count: number
  created_at: string
}

export interface MessageUnstampedEvent {
  message_id: MessageId
  user_id: UserId
  stamp_id: StampId
}

export type MessagePinnedEvent = PinBody
export type MessageUnpinnedEvent = PinBody

/*
 * Stamp
 */
type StampEvent = {
  STAMP_CREATED: StampCreatedEvent
  STAMP_UPDATED: StampUpdatedEvent
  STAMP_DELETED: StampDeletedEvent
  STAMP_PALETTE_CREATED: StampPaletteCreatedEvent
  STAMP_PALETTE_UPDATED: StampPaletteUpdatedEvent
  STAMP_PALETTE_DELETED: StampPaletteDeletedEvent
}

interface StampIdBody {
  id: StampId
}

interface StampPaletteIdBody {
  id: StampPaletteId
}

export type StampCreatedEvent = StampIdBody
export type StampUpdatedEvent = StampIdBody
export type StampDeletedEvent = StampIdBody
export type StampPaletteCreatedEvent = StampPaletteIdBody
export type StampPaletteUpdatedEvent = StampPaletteIdBody
export type StampPaletteDeletedEvent = StampPaletteIdBody

/*
 * Clip Folder
 */
type ClipFolderEvent = {
  CLIP_FOLDER_CREATED: ClipFolderCreatedEvent
  CLIP_FOLDER_UPDATED: ClipFolderUpdatedEvent
  CLIP_FOLDER_DELETED: ClipFolderDeletedEvent
  CLIP_FOLDER_MESSAGE_ADDED: ClipFolderMessageAddedEvent
  CLIP_FOLDER_MESSAGE_DELETED: ClipFolderMessageDeletedEvent
}

type ClipFolderIdBody = {
  id: ClipFolderId
}

type ClipFolderIdAndMessageIdBody = {
  folder_id: ClipFolderId
  message_id: MessageId
}

export type ClipFolderCreatedEvent = ClipFolderIdBody
export type ClipFolderUpdatedEvent = ClipFolderIdBody
export type ClipFolderDeletedEvent = ClipFolderIdBody
export type ClipFolderMessageAddedEvent = ClipFolderIdAndMessageIdBody
export type ClipFolderMessageDeletedEvent = ClipFolderIdAndMessageIdBody

/*
 * Qall
 */
type QallEvent = {
  QALL_ROOM_STATE_CHANGED: QallRoomStateChangedEvent
  QALL_SOUNDBOARD_ITEM_CREATED: QallSoundboardItemCreatedEvent
  QALL_SOUNDBOARD_ITEM_DELETED: QallSoundboardItemDeletedEvent
}
