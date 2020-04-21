import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import { S, LoadingDirection } from './state'
import { Embedding } from '@/lib/embeddingExtractor'
import { Pin, ChannelViewer } from '@traptitech/traq'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId
  },
  setMessageIds(state, messageIds: MessageId[]) {
    state.messageIds = messageIds
  },
  addMessageId(state, messageId: MessageId) {
    state.messageIds.push(messageId)
  },
  updateMessageId(state, messageId: MessageId) {
    if (state.messageIds.indexOf(messageId) === -1) {
      state.messageIds.push(messageId)
    }
  },
  deleteMessageId(state, messageId: MessageId) {
    state.messageIds = state.messageIds.filter(id => id !== messageId)
  },
  setPinnedMessages(state, messages: Pin[]) {
    state.pinnedMessages = messages
  },
  addPinnedMessages(state, message: Pin) {
    state.pinnedMessages.push(message)
  },
  removePinnedMessageIds(state, messageId: MessageId) {
    const index = state.pinnedMessages.findIndex(
      element => element.message.id === messageId
    )
    if (index > -1) {
      state.pinnedMessages.splice(index, 1)
    }
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
  setCurrentViewer(state, viewers: ChannelViewer[]) {
    state.currentViewers = viewers
  },
  setTopic(state, topic: string) {
    state.topic = topic
  },
  setSubscribers(state, subscribers: UserId[]) {
    state.subscribers = subscribers
  },
  setIsInitialLoad(state, loadedOnce: boolean) {
    state.isInitialLoad = loadedOnce
  },
  setLastLoadingDirection(state, direction: LoadingDirection) {
    state.lastLoadingDirection = direction
  }
})
