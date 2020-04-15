import { MessageId, ChannelId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string | undefined>
  embeddedFilesMap: Record<MessageId, EmbeddedFile[] | undefined>
  isReachedEnd: boolean
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  currentOffset: 0,
  fetchLimit: 50,
  renderedContentMap: {},
  embeddedFilesMap: {},
  isReachedEnd: false
}
