import apis from '@/lib/apis'
import store from '@/_store'
import {
  UserIconUpdatedEvent,
  UserWebRTCStateChangedEvent,
  UserUpdatedEvent
} from './events'
import { formatSnakeKeysToCamelShallow } from '@/lib/util/record'
import { WebRTCUserState } from '@traptitech/traq'

export const onUserUpdated = async ({ id }: UserUpdatedEvent) => {
  if (store.state.domain.me.detail?.id === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserIconUpdated = async ({ id }: UserIconUpdatedEvent) => {
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
