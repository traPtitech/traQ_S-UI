/* eslint-disable no-console */
import apis from '@/lib/apis'
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
  UserGroupDeletedEvent,
  UserUpdatedEvent
} from './events'

export const onUserJoined = async ({ id }: UserJoinedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.addUser({ id, entity: res.data })
}

export const onUserUpdated = async ({ id }: UserUpdatedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.extendUsers({ [id]: res.data })

  if (store.state.domain.userDetails[id]) {
    store.commit.domain.setUserDetail(res.data)
  }

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserLeft = ({ id }: UserLeftEvent['body']) => {
  store.commit.entities.deleteUser(id)
}

export const onUserTagsUpdated = ({ id }: UserTagsUpdatedEvent['body']) => {
  if (store.state.domain.userDetails[id]) {
    store.dispatch.domain.fetchUserDetail(id)
  }
}

export const onUserIconUpdated = async ({
  id
}: UserIconUpdatedEvent['body']) => {
  const res = await apis.getUser(id)
  store.commit.entities.extendUsers({ [id]: res.data })

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserOnline = ({ id }: UserOnlineEvent['body']) => {
  store.commit.domain.addOnlineUser(id)
}

export const onUserOffline = ({ id }: UserOfflineEvent['body']) => {
  store.commit.domain.deleteOnlineUser(id)
}

export const onUserWebRTCStateChanged = (
  data: UserWebRTCStateChangedEvent['body']
) => {
  console.error('onUserWebRTCStateChanged: Not implemented')
}

export const onUserGroupCreated = async ({
  id
}: UserGroupCreatedEvent['body']) => {
  const res = await apis.getUserGroup(id)
  store.commit.entities.addUserGroup({ id, entity: res.data })
}

export const onUserGroupUpdated = async ({
  id
}: UserGroupUpdatedEvent['body']) => {
  const res = await apis.getUserGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
}

export const onUserGroupDeleted = ({ id }: UserGroupDeletedEvent['body']) => {
  store.commit.entities.deleteUserGroup(id)
}
