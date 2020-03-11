import { UserId, ChannelId, UserGroupId } from '@/types/entity-ids'

export interface UserJoinedEvent {
  type: 'USER_JOINED'
  body: {
    id: UserId
  }
}
export const onUserJoined = (data: UserJoinedEvent['body']) => {}

export interface UserLeftEvent {
  type: 'USER_LEFT'
  body: {
    id: UserId
  }
}
export const onUserLeft = (data: UserLeftEvent['body']) => {}

export interface UserTagsUpdatedEvent {
  type: 'USER_TAGS_UPDATED'
  body: {
    id: UserId
  }
}
export const onUserTagsUpdated = (data: UserTagsUpdatedEvent['body']) => {}

export interface UserIconUpdatedEvent {
  type: 'USER_ICON_UPDATED'
  body: {
    id: UserId
  }
}
export const onUserIconUpdated = (data: UserIconUpdatedEvent['body']) => {}

export interface UserOnlineEvent {
  type: 'USER_ONLINE'
  body: {
    id: UserId
  }
}
export const onUserOnline = (data: UserOnlineEvent['body']) => {}

export interface UserOfflineEvent {
  type: 'USER_OFFLINE'
  body: {
    id: UserId
  }
}
export const onUserOffline = (data: UserOfflineEvent['body']) => {}

export interface UserWebRTCStateChangedEvent {
  type: 'USER_WEBRTC_STATE_CHANGED'
  body: {
    user_id: UserId
    channel_id: ChannelId
    state: string // TODO: もっと厳密にする
  }
}
export const onUserWebRTCStateChanged = (
  data: UserWebRTCStateChangedEvent['body']
) => {}

export interface UserGroupCreatedEvent {
  type: 'USER_GROUP_CREATED'
  body: null
}
export const onUserGroupCreated = (data: UserGroupCreatedEvent['body']) => {}

export interface UserGroupDeletedEvent {
  type: 'USER_GROUP_DELETED'
  body: {
    id: UserGroupId
  }
}
export const onUserGroupDeleted = (data: UserGroupDeletedEvent['body']) => {}

export interface UserGroupMemberAddedEvent {
  type: 'USER_GROUP_MEMBER_ADDED'
  body: {
    id: UserGroupId
    user_id: UserId
  }
}
export const onUserGroupMemberAdded = (
  data: UserGroupMemberAddedEvent['body']
) => {}

export interface UserGroupMemberRemovedEvent {
  type: 'USER_GROUP_MEMBER_REMOVED'
  body: {
    id: UserGroupId
    user_id: UserId
  }
}
export const onUserGroupMemberRemoved = (
  data: UserGroupMemberRemovedEvent['body']
) => {}
