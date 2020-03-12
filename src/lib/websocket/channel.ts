import { ChannelId, UserId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

export interface ChannelCreatedEvent {
  type: 'CHANNEL_CREATED'
  body: {
    id: ChannelId
  }
}
export const onChannelCreated = async ({ id }: ChannelCreatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.addChannel({ id, entity: res.data })
}

export interface ChannelDeletedEvent {
  type: 'CHANNEL_DELETED'
  body: {
    id: ChannelId
  }
}
export const onChannelDeleted = ({ id }: ChannelDeletedEvent['body']) => {
  store.commit.entities.deleteChannel(id)
}

export interface ChannelUpdatedEvent {
  type: 'CHANNEL_UPDATED'
  body: {
    id: ChannelId
  }
}
export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.extendChannels({ [id]: res.data })
}

export interface ChannelStaredEvent {
  type: 'CHANNEL_STARED'
  body: {
    id: ChannelId
  }
}
export const onChannelStared = (data: ChannelStaredEvent['body']) => {
  console.error('onChannelStared: Not implemented')
}

export interface ChannelUnstaredEvent {
  type: 'CHANNEL_UNSTARED'
  body: {
    id: ChannelId
  }
}
export const onChannelUnstared = (data: ChannelUnstaredEvent['body']) => {
  console.error('onChannelUnstared: Not implemented')
}

export interface ChannelViewersChangedEvent {
  type: 'CHANNEL_VIEWERS_CHANGED'
  body: {
    id: ChannelId
    viewers: UserId[]
  }
}
export const onChannelViewersChanged = (
  data: ChannelViewersChangedEvent['body']
) => {
  console.error('onChannelViewersChanged: Not implemented')
}
