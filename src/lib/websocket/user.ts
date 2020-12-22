import apis from '@/lib/apis'
import store from '@/_store'
import {
  UserTagsUpdatedEvent,
  UserIconUpdatedEvent,
  UserWebRTCStateChangedEvent,
  UserUpdatedEvent
} from './events'
import { formatSnakeKeysToCamelShallow } from '@/lib/util/record'
import { WebRTCUserState } from '@traptitech/traq'

export const onUserUpdated = async ({ id }: UserUpdatedEvent) => {
  const { data: user } = await apis.getUser(id)

  if (store.state.domain.userDetails[id]) {
    store.commit.domain.setUserDetail(user)
  }

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserTagsUpdated = ({ id }: UserTagsUpdatedEvent) => {
  if (store.state.domain.userDetails[id]) {
    store.dispatch.domain.fetchUserDetail(id)
  }
}

export const onUserIconUpdated = async ({ id }: UserIconUpdatedEvent) => {
  const { data: user } = await apis.getUser(id)

  if (store.state.domain.userDetails[id]) {
    store.commit.domain.setUserDetail(user)
  }

  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserWebRTCStateChanged = (
  dataSnake: UserWebRTCStateChangedEvent
) => {
  const data = formatSnakeKeysToCamelShallow(dataSnake) as WebRTCUserState
  store.commit.app.rtc.updateRTCState(data)
}
