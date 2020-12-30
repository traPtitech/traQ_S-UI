import apis from '@/lib/apis'
import store from '@/_store'
import { UserIconUpdatedEvent, UserUpdatedEvent } from './events'

export const onUserUpdated = async ({ id }: UserUpdatedEvent) => {
  if (store.getters.domain.me.myId === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}

export const onUserIconUpdated = async ({ id }: UserIconUpdatedEvent) => {
  if (store.getters.domain.me.myId === id) {
    const res = await apis.getMe()
    store.commit.domain.me.setDetail(res.data)
  }
}
