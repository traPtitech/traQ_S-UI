import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/_store'
import { messagesView } from './index'
import { ChannelId, MessageId, StampId, ClipFolderId } from '@/types/entity-ids'
import { ChannelViewState, Message } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import apis from '@/lib/apis'
import { changeViewState } from '@/lib/websocket'
import { ActionContext } from 'vuex'
import {
  isFile,
  isMessage,
  isExternalUrl
} from '@/lib/util/guard/embeddingOrUrl'

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

    // 設定画面から戻ってきたときの場合があるので同じチャンネルでも送りなおす
    changeViewState(payload.channelId, ChannelViewState.Monitoring)

    if (state.currentChannelId === payload.channelId) return

    commit.unsetCurrentClipFolderId()

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
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentClipFolderId === clipFolderId) return

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

    const rendered = await render(content)

    const filePromises = rendered.embeddings.filter(isFile).map(async e => {
      try {
        await rootDispatch.entities.fetchFileMetaByFileId(e.id)
      } catch {
        // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
      }
    })
    const messagePromises = rendered.embeddings
      .filter(isMessage)
      .map(async e => {
        try {
          const message = await rootDispatch.entities.fetchMessage(e.id)

          // テキスト部分のみレンダリング
          const rendered = await render(message.content)
          commit.addRenderedContent({
            messageId: message.id,
            renderedContent: rendered.renderedText
          })
        } catch {
          // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
        }
      })
    const urlPromises = rendered.embeddings
      .filter(isExternalUrl)
      .slice(0, 2) // OGPが得られるかにかかわらず2個に制限
      .map(async e => {
        try {
          await rootDispatch.entities.fetchOgpData(e.url)
        } catch {
          // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
        }
      })

    await Promise.all([...filePromises, ...messagePromises, ...urlPromises])

    commit.addRenderedContent({
      messageId,
      renderedContent: rendered.renderedText
    })
    commit.addEmbedding({
      messageId,
      embeddings: rendered.embeddings
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
  async addPinned(_, payload: { messageId: MessageId }) {
    await apis.createPin(payload.messageId)
  },
  async removePinned(_, payload: { messageId: MessageId }) {
    await apis.removePin(payload.messageId)
  }
})
