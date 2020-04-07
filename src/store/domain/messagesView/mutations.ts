import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'
import { ChannelViewerState } from '@/lib/websocket/events'
import { Pin } from '@traptitech/traq'

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
  setCurrentViewer(state, viewers: ChannelViewerState[]) {
    state.currentViewers = viewers
  },
  setTopic(state, topic: string) {
    state.topic = topic
  },
  setSubscribers(state, subscribers: UserId[]) {
    state.subscribers = subscribers
  }
})
