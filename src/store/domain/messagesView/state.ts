import { MessageId, ChannelId, UserId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'
import { Pin, ChannelViewer } from '@traptitech/traq'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  pinnedMessages: Pin[]
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string>
  embeddedFilesMap: Record<MessageId, EmbeddedFile[]>
  isReachedEnd: boolean
  currentViewers: ChannelViewer[]
  topic: string
  subscribers: UserId[]
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  pinnedMessages: [],
  currentOffset: 0,
  fetchLimit: 50,
  renderedContentMap: {},
  embeddedFilesMap: {},
  isReachedEnd: false,
  currentViewers: [],
  topic: '',
  subscribers: []
}
