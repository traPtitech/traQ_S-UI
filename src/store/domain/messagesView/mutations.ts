import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { ChannelId, MessageId, UserId, ClipFolderId } from '@/types/entity-ids'
import { S } from './state'
import { Pin, ChannelViewer } from '@traptitech/traq'
import store from '@/store'
import useCurrentChannelPath from '@/use/currentChannelPath'

import { EmbeddingOrUrl } from '@traptitech/traq-markdown-it/dist/embeddingExtractor'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId

    // 通常のチャンネルでない場合は最後に開いたチャンネルとして保持しない
    if (!store.state.entities.channels[currentChannelId]) return

    const { currentChannelPathString } = useCurrentChannelPath()
    store.commit.app.browserSettings.setLastOpenChannelName(
      currentChannelPathString.value
    )
  },
  setCurrentClipFolderId(state, currentClipFolderId: ClipFolderId) {
    state.currentClipFolderId = currentClipFolderId
  },
  unsetCurrentChannelId(state) {
    state.currentChannelId = undefined
  },
  unsetCurrentClipFolderId(state) {
    state.currentClipFolderId = undefined
  },
  setMessageIds(state, messageIds: MessageId[]) {
    state.messageIds = messageIds
  },
  setShouldRetriveMessageCreateEvent(
    state,
    shouldRetriveMessageCreateEvent: boolean
  ) {
    state.shouldRetriveMessageCreateEvent = shouldRetriveMessageCreateEvent
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
  addRenderedContent(
    state,
    {
      messageId,
      renderedContent
    }: { messageId: MessageId; renderedContent: string }
  ) {
    Vue.set(state.renderedContentMap, messageId, renderedContent)
  },
  setRenderedContent(state, renderedContentMap: Record<string, string>) {
    state.renderedContentMap = renderedContentMap
  },
  addEmbedding(
    state,
    payload: { messageId: MessageId; embeddings: EmbeddingOrUrl[] }
  ) {
    Vue.set(state.embeddingsMap, payload.messageId, payload.embeddings)
  },
  setCurrentViewer(state, viewers: ChannelViewer[]) {
    state.currentViewers = viewers
  },
  setTopic(state, topic: string) {
    state.topic = topic
  },
  setBots(state, bots: UserId[]) {
    state.bots = bots
  },
  setSubscribers(state, subscribers: UserId[]) {
    state.subscribers = subscribers
  },
  setEditingMessageId(state, messageId: MessageId) {
    state.editingMessageId = messageId
  },
  unsetEditingMessageId(state) {
    state.editingMessageId = undefined
  },
  setUnreadSince(state, since: string) {
    state.unreadSince = since
  },
  unsetUnreadSince(state) {
    state.unreadSince = undefined
  }
})
