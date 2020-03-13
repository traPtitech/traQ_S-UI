/* eslint-disable no-console */
import { UserId, ChannelId, UserGroupId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

interface UserIdBody {
  id: UserId
}

export interface UserJoinedEvent {
  type: 'USER_JOINED'
  body: UserIdBody
}
export const onUserJoined = async ({ id }: UserJoinedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.addUser({ id, entity: res.data })
}

export interface UserLeftEvent {
  type: 'USER_LEFT'
  body: UserIdBody
}
export const onUserLeft = ({ id }: UserLeftEvent['body']) => {
  store.commit.entities.deleteUser(id)
}

export interface UserTagsUpdatedEvent {
  type: 'USER_TAGS_UPDATED'
  body: UserIdBody
}
export const onUserTagsUpdated = (data: UserTagsUpdatedEvent['body']) => {
  console.error('onUserTagsUpdated: Not implemented')
}

export interface UserIconUpdatedEvent {
  type: 'USER_ICON_UPDATED'
  body: UserIdBody
}
export const onUserIconUpdated = (data: UserIconUpdatedEvent['body']) => {
  console.error('onUserIconUpdated: Not implemented')
}

export interface UserOnlineEvent {
  type: 'USER_ONLINE'
  body: UserIdBody
}
export const onUserOnline = (data: UserOnlineEvent['body']) => {
  console.error('onUserOnline: Not implemented')
}

export interface UserOfflineEvent {
  type: 'USER_OFFLINE'
  body: UserIdBody
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

export interface UserGroupUpdatedEvent {
  type: 'USER_GROUP_UPDATED'
  body: {
    id: UserGroupId
  }
}
export const onUserGroupUpdated = async ({
  id
}: UserGroupUpdatedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
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
