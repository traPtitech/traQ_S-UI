import { defineMutations } from 'direct-vuex'
import { ChannelId, MessageId, ClipFolderId } from '@/types/entity-ids'
import { S } from './state'
import { Pin, ChannelViewer, Message } from '@traptitech/traq'
import _store from '@/_store'
import useCurrentChannelPath from '@/use/currentChannelPath'
import { EmbeddingOrUrl } from '@traptitech/traq-markdown-it'
import store from '@/store'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId

    // TODO: いい感じにする
    // 通常のチャンネルでない場合は最後に開いたチャンネルとして保持しない
    if (!store.state.entities.channelsMap.get(currentChannelId)) return

    const { currentChannelPathString } = useCurrentChannelPath()
    _store.commit.app.browserSettings.setLastOpenChannelName(
      currentChannelPathString.value
    )
  },
  unsetCurrentChannelId(state) {
    state.currentChannelId = undefined
  },
  setCurrentClipFolderId(state, currentClipFolderId: ClipFolderId) {
    state.currentClipFolderId = currentClipFolderId
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
  unsetMessageIds(state) {
    state.messageIds = []
  },
  setPinnedMessages(state, messages: Pin[]) {
    state.pinnedMessages = messages
  },
  unsetPinnedMessages(state) {
    state.pinnedMessages = []
  },
  addPinnedMessage(state, message: Pin) {
    state.pinnedMessages.push(message)
  },
  updatePinnedMessage(state, message: Message) {
    const index = state.pinnedMessages.findIndex(
      element => element.message.id === message.id
    )
    if (index > -1) {
      state.pinnedMessages[index].message = message
    }
  },
  removePinnedMessage(state, messageId: MessageId) {
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
    state.renderedContentMap.set(messageId, renderedContent)
  },
  setRenderedContent(state, renderedContentMap: Map<string, string>) {
    state.renderedContentMap = renderedContentMap
  },
  unsetRenderedContent(state) {
    state.renderedContentMap = new Map()
  },
  addEmbedding(
    state,
    payload: { messageId: MessageId; embeddings: EmbeddingOrUrl[] }
  ) {
    state.embeddingsMap.set(payload.messageId, payload.embeddings)
  },
  setCurrentViewers(state, viewers: ChannelViewer[]) {
    state.currentViewers = viewers
  },
  unsetCurrentViewers(state) {
    state.currentViewers = []
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
