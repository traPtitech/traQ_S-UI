import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId
  },
  setMessageIds(state, messageIds: MessageId[]) {
    state.messageIds = messageIds
  },
  setLoadedMessageLatestDate(state, date: Date) {
    state.loadedMessageLatestDate = date
  },
  setLoadedMessageOldestDate(state, date: Date) {
    state.loadedMessageOldestDate = date
  },
  unsetLoadedMessageLatestDate(state) {
    state.loadedMessageLatestDate = undefined
  },
  unsetLoadedMessageOldestDate(state) {
    state.loadedMessageOldestDate = undefined
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
  setIsReachedLatest(state, isReachedLatest: boolean) {
    state.isReachedLatest = isReachedLatest
  },
  addEmbededFile(
    state,
    payload: { messageId: MessageId; files: EmbeddedFile[] }
  ) {
    Vue.set(state.embeddedFilesMap, payload.messageId, payload.files)
  }
})
