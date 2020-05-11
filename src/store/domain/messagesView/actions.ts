import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId, StampId, ClipFolderId } from '@/types/entity-ids'
import { ChannelViewState, Message } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import apis from '@/lib/apis'
import { changeViewState } from '@/lib/websocket'
import { embeddingExtractor } from '@/lib/embeddingExtractor'
import { ActionContext } from 'vuex'

export const messagesViewActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messagesView)

export const actions = defineActions({
  resetViewState(context) {
    const { commit } = messagesViewActionContext(context)
    commit.setMessageIds([])
    commit.setRenderedContent({})
    commit.setCurrentViewer([])
    commit.setSubscribers([])
  },
  async changeCurrentChannel(
    context,
    payload: {
      channelId: ChannelId
      entryMessageId?: MessageId
      isDM?: boolean
    }
  ) {
    const { state, commit, dispatch, rootState } = messagesViewActionContext(
      context
    )
    if (state.currentChannelId === payload.channelId) return

    commit.unsetCurrentClipFolderId()

    changeViewState(payload.channelId, ChannelViewState.Monitoring)
    commit.setCurrentChannelId(payload.channelId)
    dispatch.resetViewState()

    dispatch.fetchPinnedMessages()
    if (!payload.isDM) {
      dispatch.fetchTopic()
    }
    if (
      !payload.isDM &&
      !rootState.entities.channels[payload.channelId]?.force
    ) {
      dispatch.fetchSubscribers()
    }
    if (!payload.isDM) {
      dispatch.fetchBots()
    }
  },

  /** クリップフォルダに移行 */
  async changeCurrentClipFolder(context, clipFolderId: ClipFolderId) {
    const { commit, dispatch } = messagesViewActionContext(context)
    commit.unsetCurrentChannelId()
    changeViewState(null)
    dispatch.resetViewState()
    commit.setCurrentClipFolderId(clipFolderId)
  },

  async fetchPinnedMessages(context) {
    const { state, commit } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'
    const res = await apis.getChannelPins(state.currentChannelId)
    commit.setPinnedMessages(res.data)
  },
  async fetchTopic(context) {
    const { state, commit } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'
    const res = await apis.getChannelTopic(state.currentChannelId)
    commit.setTopic(res.data.topic)
  },
  async fetchSubscribers(context) {
    const { state, commit } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'
    const res = await apis.getChannelSubscribers(state.currentChannelId)
    commit.setSubscribers(res.data)
  },
  async fetchBots(context) {
    const { state, commit } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'
    const res = await apis.getChannelBots(state.currentChannelId)
    commit.setBots(res.data.map(bot => bot.botUserId))
  },
  async fetchChannelLatestMessage(context) {
    const { state, commit, dispatch, rootDispatch } = messagesViewActionContext(
      context
    )
    if (!state.currentChannelId) throw 'no channel id'

    const { messages } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: 1,
      offset: 0
    })
    if (messages.length !== 1) return

    const messageId = messages[0].id
    await dispatch.renderMessageContent(messageId)
    commit.setMessageIds([...state.messageIds, messageId])
  },
  async renderMessageContent(context, messageId: string) {
    const { commit, rootState, rootDispatch } = messagesViewActionContext(
      context
    )
    const content = rootState.entities.messages[messageId]?.content ?? ''

    const extracted = embeddingExtractor(content)

    await Promise.all(
      extracted.embeddings.map(async e => {
        try {
          if (e.type === 'file') {
            await rootDispatch.entities.fetchFileMetaByFileId(e.id)
          }
          if (e.type === 'message') {
            const message = await rootDispatch.entities.fetchMessage(e.id)

            // テキスト部分のみレンダリング
            const extracted = embeddingExtractor(message.content)
            const renderedContent = render(extracted.text)
            commit.addRenderedContent({
              messageId: message.id,
              renderedContent
            })
          }
        } catch (e) {
          // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
        }
      })
    )

    const renderedContent = render(extracted.text)
    commit.addRenderedContent({ messageId, renderedContent })
    commit.addEmbedding({
      messageId,
      embeddings: extracted.embeddings
    })
  },
  async addAndRenderMessage(context, payload: { message: Message }) {
    const { commit, dispatch } = messagesViewActionContext(context)
    await dispatch.renderMessageContent(payload.message.id)
    commit.addMessageId(payload.message.id)
    store.commit.domain.me.deleteUnreadChannel(payload.message.channelId)
  },
  async updateAndRenderMessageId(context, payload: { message: Message }) {
    const { commit, dispatch } = messagesViewActionContext(context)
    await dispatch.renderMessageContent(payload.message.id)
    commit.updateMessageId(payload.message.id)
    store.commit.domain.me.deleteUnreadChannel(payload.message.channelId)
  },
  async addStamp(_, payload: { messageId: MessageId; stampId: StampId }) {
    apis.addMessageStamp(payload.messageId, payload.stampId)
    store.commit.domain.me.upsertLocalStampHistory({
      stampId: payload.stampId,
      datetime: new Date()
    })
  },
  removeStamp(_, payload: { messageId: MessageId; stampId: StampId }) {
    apis.removeMessageStamp(payload.messageId, payload.stampId)
  },
  addPinned(_, payload: { messageId: MessageId }) {
    apis.createPin(payload.messageId)
  },
  removePinned(_, payload: { messageId: MessageId }) {
    apis.removePin(payload.messageId)
  }
})
