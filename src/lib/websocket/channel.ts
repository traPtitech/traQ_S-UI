import { ChannelId, UserId } from '@/types/entity-ids'

export interface ChannelCreatedEvent {
  type: 'CHANNEL_CREATED'
  body: {
    id: ChannelId
  }
}
export const onChannelCreated = (data: ChannelCreatedEvent['body']) => {}

export interface ChannelDeletedEvent {
  type: 'CHANNEL_DELETED'
  body: {
    id: ChannelId
  }
}
export const onChannelDeleted = (data: ChannelDeletedEvent['body']) => {}

export interface ChannelUpdatedEvent {
  type: 'CHANNEL_UPDATED'
  body: {
    id: ChannelId
  }
}
export const onChannelUpdated = (data: ChannelUpdatedEvent['body']) => {}

export interface ChannelStaredEvent {
  type: 'CHANNEL_STARED'
  body: {
    id: ChannelId
  }
}
export const onChannelStared = (data: ChannelStaredEvent['body']) => {}

export interface ChannelUnstaredEvent {
  type: 'CHANNEL_UNSTARED'
  body: {
    id: ChannelId
  }
}
export const onChannelUnstared = (data: ChannelUnstaredEvent['body']) => {}

export interface ChannelViewersChangedEvent {
  type: 'CHANNEL_VIEWERS_CHANGED'
  body: {
    id: ChannelId
    viewers: UserId[]
  }
}
export const onChannelViewersChanged = (
  data: ChannelViewersChangedEvent['body']
) => {}
