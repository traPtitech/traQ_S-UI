/* eslint-disable no-console */
import { UserId, ChannelId, UserGroupId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

export interface UserJoinedEvent {
  type: 'USER_JOINED'
  body: {
    id: UserId
  }
}
export const onUserJoined = async ({ id }: UserJoinedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.addUser({ id, entity: res.data })
}

export interface UserLeftEvent {
  type: 'USER_LEFT'
  body: {
    id: UserId
  }
}
export const onUserLeft = ({ id }: UserLeftEvent['body']) => {
  store.commit.entities.deleteUser(id)
}

export interface UserTagsUpdatedEvent {
  type: 'USER_TAGS_UPDATED'
  body: {
    id: UserId
  }
}
export const onUserTagsUpdated = (data: UserTagsUpdatedEvent['body']) => {
  console.error('onUserTagsUpdated: Not implemented')
}

export interface UserIconUpdatedEvent {
  type: 'USER_ICON_UPDATED'
  body: {
    id: UserId
  }
}
export const onUserIconUpdated = (data: UserIconUpdatedEvent['body']) => {
  console.error('onUserIconUpdated: Not implemented')
}

export interface UserOnlineEvent {
  type: 'USER_ONLINE'
  body: {
    id: UserId
  }
}
export const onUserOnline = (data: UserOnlineEvent['body']) => {
  console.error('onUserOnline: Not implemented')
}

export interface UserOfflineEvent {
  type: 'USER_OFFLINE'
  body: {
    id: UserId
  }
}
export const onUserOffline = (data: UserOfflineEvent['body']) => {
  console.error('onUserOffline: Not implemented')
}

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
) => {
  console.error('onUserWebRTCStateChanged: Not implemented')
}

export interface UserGroupCreatedEvent {
  type: 'USER_GROUP_CREATED'
  body: {
    id: UserGroupId
  }
}
export const onUserGroupCreated = async ({
  id
}: UserGroupCreatedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.addUserGroup({ id, entity: res.data })
}

export interface UserGroupDeletedEvent {
  type: 'USER_GROUP_DELETED'
  body: {
    id: UserGroupId
  }
}
export const onUserGroupDeleted = ({ id }: UserGroupDeletedEvent['body']) => {
  store.commit.entities.deleteUserGroup(id)
}

export interface UserGroupMemberAddedEvent {
  type: 'USER_GROUP_MEMBER_ADDED'
  body: {
    id: UserGroupId
    user_id: UserId
  }
}
export const onUserGroupMemberAdded = async ({
  id
}: UserGroupMemberAddedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
  // TODO: ユーザー追加するmutationを追加する
}

export interface UserGroupMemberRemovedEvent {
  type: 'USER_GROUP_MEMBER_REMOVED'
  body: {
    id: UserGroupId
    user_id: UserId
  }
}
export const onUserGroupMemberRemoved = async ({
  id
}: UserGroupMemberRemovedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
  // TODO: ユーザー削除するmutationを追加する
}
