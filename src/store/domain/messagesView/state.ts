import { MessageId, ChannelId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  entryMessageId?: MessageId
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string>
  embeddedFilesMap: Record<MessageId, EmbeddedFile[]>
  isReachedEnd: boolean
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  entryMessageId: undefined,
  currentOffset: 0,
  fetchLimit: 50,
  renderedContentMap: {},
  embeddedFilesMap: {},
  isReachedEnd: false
}
