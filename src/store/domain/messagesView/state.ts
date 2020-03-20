import { MessageId, ChannelId } from '@/types/entity-ids'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string>
  isReachedEnd: boolean
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  currentOffset: 0,
  fetchLimit: 50,
  renderedContentMap: {},
  isReachedEnd: false
}
