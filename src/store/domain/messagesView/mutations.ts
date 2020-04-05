import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId
  },
  setCurrentOffset(state, currentOffset: number) {
    state.currentOffset = currentOffset
  },
  setMessageIds(state, messageIds: MessageId[]) {
    state.messageIds = messageIds
  },
  addRenderedContent(
    state,
    {
      messageId,
      renderedContent
    }: { messageId: MessageId; renderedContent: string }
  ) {
    state.renderedContentMap[messageId] = renderedContent
  },
  setRenderedContent(state, renderedContentMap: Record<string, string>) {
    state.renderedContentMap = renderedContentMap
  },
  setIsReachedEnd(state, isReachedEnd: boolean) {
    state.isReachedEnd = isReachedEnd
  },
  addEmbededFile(
    state,
    payload: { messageId: MessageId; files: EmbeddedFile[] }
  ) {
    Vue.set(state.embeddedFilesMap, payload.messageId, payload.files)
  },
  setCurrentViewer(state, viewerIds: UserId[]) {
    state.currentViewerIds = viewerIds
  }
})
