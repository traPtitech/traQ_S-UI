import { MessageId, ChannelId, UserId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'
import { ChannelViewerState } from '@/lib/websocket/events'
import { Pin } from '@traptitech/traq'

export interface S {
  currentChannelId: ChannelId
  messageIds: MessageId[]
  pinnedMessages: Pin[]
  currentOffset: number
  fetchLimit: number
  renderedContentMap: Record<MessageId, string>
  embeddedFilesMap: Record<MessageId, EmbeddedFile[]>
  isReachedEnd: boolean
  currentViewers: ChannelViewerState[]
  topic: string
  subscribers: UserId[] | undefined
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
