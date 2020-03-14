/* eslint-disable no-console */
import apis from '@/lib/api'
import store from '@/store'
import {
  UserJoinedEvent,
  UserLeftEvent,
  UserTagsUpdatedEvent,
  UserIconUpdatedEvent,
  UserOnlineEvent,
  UserOfflineEvent,
  UserWebRTCStateChangedEvent,
  UserGroupCreatedEvent,
  UserGroupUpdatedEvent,
  UserGroupDeletedEvent
} from './events'

export const onUserJoined = async ({ id }: UserJoinedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.addUser({ id, entity: res.data })
}

export const onUserLeft = ({ id }: UserLeftEvent['body']) => {
  store.commit.entities.deleteUser(id)
}

export const onUserTagsUpdated = (data: UserTagsUpdatedEvent['body']) => {
  console.error('onUserTagsUpdated: Not implemented')
}

export const onUserIconUpdated = (data: UserIconUpdatedEvent['body']) => {
  console.error('onUserIconUpdated: Not implemented')
}

export const onUserOnline = (data: UserOnlineEvent['body']) => {
  console.error('onUserOnline: Not implemented')
}

export const onUserOffline = (data: UserOfflineEvent['body']) => {
  console.error('onUserOffline: Not implemented')
}

export const onUserWebRTCStateChanged = (
  data: UserWebRTCStateChangedEvent['body']
) => {
  console.error('onUserWebRTCStateChanged: Not implemented')
}

export const onUserGroupCreated = async ({
  id
}: UserGroupCreatedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.addUserGroup({ id, entity: res.data })
}

export const onUserGroupUpdated = async ({
  id
}: UserGroupUpdatedEvent['body']) => {
  const res = await apis.getGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
}

export const onUserGroupDeleted = ({ id }: UserGroupDeletedEvent['body']) => {
  store.commit.entities.deleteUserGroup(id)
}
