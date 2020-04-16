import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S, LoadingDirection } from './state'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { Embedding } from '@/lib/embeddingExtractor'

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
  setEntryMessageId(state, messageId: MessageId) {
    state.entryMessageId = messageId
  },
  unsetEntryMessageId(state) {
    state.entryMessageId = undefined
  },
  addEmbedding(
    state,
    payload: { messageId: MessageId; embeddings: Embedding[] }
  ) {
    Vue.set(state.embeddingsMap, payload.messageId, payload.embeddings)
  },
  setIsInitialLoad(state, loadedOnce: boolean) {
    state.isInitialLoad = loadedOnce
  },
  setLastLoadingDirection(state, direction: LoadingDirection) {
    state.lastLoadingDirection = direction
  }
})
