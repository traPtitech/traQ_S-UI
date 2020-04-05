import { MessageId, ChannelId, UserId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string>
  embeddedFilesMap: Record<MessageId, EmbeddedFile[]>
  isReachedEnd: boolean
  currentViewerIds: UserId[]
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  currentOffset: 0,
  fetchLimit: 50,
  renderedContentMap: {},
  embeddedFilesMap: {},
  isReachedEnd: false,
  currentViewerIds: []
}
