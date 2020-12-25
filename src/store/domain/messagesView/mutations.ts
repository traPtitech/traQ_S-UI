import { defineMutations } from 'direct-vuex'
import { ChannelId, MessageId, ClipFolderId } from '@/types/entity-ids'
import { S } from './state'
import { Pin, ChannelViewer } from '@traptitech/traq'
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
  addPinnedMessage(state, message: Pin) {
    state.pinnedMessages.push(message)
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
    state.renderedContentMap[messageId] = renderedContent
  },
  setRenderedContent(state, renderedContentMap: Record<string, string>) {
    state.renderedContentMap = renderedContentMap
  },
  addEmbedding(
    state,
    payload: { messageId: MessageId; embeddings: EmbeddingOrUrl[] }
  ) {
    state.embeddingsMap[payload.messageId] = payload.embeddings
  },
  setCurrentViewers(state, viewers: ChannelViewer[]) {
    state.currentViewers = viewers
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
