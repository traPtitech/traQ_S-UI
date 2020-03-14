/* eslint-disable no-console */
import apis from '@/lib/api'
import store from '@/store'
import {
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  ChannelStaredEvent,
  ChannelUnstaredEvent,
  ChannelViewersChangedEvent
} from './events'

export const onChannelCreated = async ({ id }: ChannelCreatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.addChannel({ id, entity: res.data })
}

export const onChannelDeleted = ({ id }: ChannelDeletedEvent['body']) => {
  store.commit.entities.deleteChannel(id)
}

export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.extendChannels({ [id]: res.data })
}

export const onChannelStared = (data: ChannelStaredEvent['body']) => {
  console.error('onChannelStared: Not implemented')
}

export const onChannelUnstared = (data: ChannelUnstaredEvent['body']) => {
  console.error('onChannelUnstared: Not implemented')
}

export const onChannelViewersChanged = (
  data: ChannelViewersChangedEvent['body']
) => {
  console.error('onChannelViewersChanged: Not implemented')
}
