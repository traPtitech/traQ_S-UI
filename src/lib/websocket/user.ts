import apis from '@/lib/apis'
import store from '@/_store'
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
import { formatSnakeKeysToCamelShallow } from '@/lib/util/record'
import { WebRTCUserState } from '@traptitech/traq'

export const onUserJoined = async ({ id }: UserJoinedEvent) => {
  store.dispatch.entities.fetchUser(id)
}

export const onUserUpdated = async ({ id }: UserUpdatedEvent) => {
  const user = await store.dispatch.entities.fetchUser(id)

  if (store.state.domain.userDetails[id]) {
    store.commit.domain.setUserDetail(user)
  }

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserLeft = ({ id }: UserLeftEvent) => {
  store.commit.entities.deleteUser(id)
}

export const onUserTagsUpdated = ({ id }: UserTagsUpdatedEvent) => {
  if (store.state.domain.userDetails[id]) {
    store.dispatch.domain.fetchUserDetail(id)
  }
}

export const onUserIconUpdated = async ({ id }: UserIconUpdatedEvent) => {
  const user = await store.dispatch.entities.fetchUser(id)

  if (store.state.domain.userDetails[id]) {
    store.commit.domain.setUserDetail(user)
  }

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserOnline = ({ id }: UserOnlineEvent) => {
  store.commit.domain.addOnlineUser(id)
}

export const onUserOffline = ({ id }: UserOfflineEvent) => {
  store.commit.domain.deleteOnlineUser(id)
}

export const onUserWebRTCStateChanged = (
  dataSnake: UserWebRTCStateChangedEvent
) => {
  const data = formatSnakeKeysToCamelShallow(dataSnake) as WebRTCUserState
  store.commit.app.rtc.updateRTCState(data)
}

export const onUserGroupCreated = async ({ id }: UserGroupCreatedEvent) => {
  const res = await apis.getUserGroup(id)
  store.commit.entities.addUserGroup({ id, entity: res.data })
}

export const onUserGroupUpdated = async ({ id }: UserGroupUpdatedEvent) => {
  const res = await apis.getUserGroup(id)
  store.commit.entities.extendUserGroups({ [id]: res.data })
}

export const onUserGroupDeleted = ({ id }: UserGroupDeletedEvent) => {
  store.commit.entities.deleteUserGroup(id)
}
