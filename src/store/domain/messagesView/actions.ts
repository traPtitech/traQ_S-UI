import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId, ClipFolderId } from '@/types/entity-ids'
import { ChannelViewer, ChannelViewState, Message } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import apis from '@/lib/apis'
import { changeViewState } from '@/lib/websocket'
import { ActionContext } from 'vuex'
import {
  isFile,
  isMessage,
  isExternalUrl
} from '@/lib/util/guard/embeddingOrUrl'
import { createSingleflight } from '@/lib/async'

interface BaseGetMessagesParams {
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
}
interface GetMessagesParams extends BaseGetMessagesParams {
  channelId: string
}

interface GetFilesChannelParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  mine?: boolean
}

interface GetClipsParam {
  folderId: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
}

interface GetDirectMessagesParams extends BaseGetMessagesParams {
  userId: string
}

export const messagesViewActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messagesView)

const getPin = createSingleflight(apis.getPin.bind(apis))

export const actions = defineActions({
  resetViewState(context) {
    const { commit } = messagesViewActionContext(context)
    commit.setMessageIds([])
    commit.setRenderedContent(new Map())
    commit.setCurrentViewers([])
  },
  async changeCurrentChannel(
    context,
    payload: {
      channelId: ChannelId
      entryMessageId?: MessageId
      isDM?: boolean
    }
  ) {
    const { state, commit, dispatch } = messagesViewActionContext(context)

    // 設定画面から戻ってきたときの場合があるので同じチャンネルでも送りなおす
    changeViewState(payload.channelId, ChannelViewState.Monitoring)

    if (state.currentChannelId === payload.channelId) return

    commit.unsetCurrentClipFolderId()

    commit.setCurrentChannelId(payload.channelId)
    dispatch.resetViewState()

    dispatch.fetchPinnedMessages()
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

  async fetchMessagesInClipFolder(context, params: GetClipsParam) {
    const { rootDispatch } = messagesViewActionContext(context)
    const { data, headers } = await apis.getClips(
      params.folderId,
      params.limit,
      params.offset,
      params.order
    )
    rootDispatch.entities.messages.extendMessagesMap(data.map(c => c.message))
    return {
      clips: data,
      hasMore: headers['x-traq-more'] === 'true'
    }
  },
  async fetchMessagesByChannelId(context, params: GetMessagesParams) {
    const { rootDispatch } = messagesViewActionContext(context)
    const res = await apis.getMessages(
      params.channelId,
      params.limit,
      params.offset,
      params.since?.toISOString(),
      params.until?.toISOString(),
      params.inclusive,
      params.order
    )
    rootDispatch.entities.messages.extendMessagesMap(res.data)
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },

  async fetchPinnedMessages(context) {
    const { state, commit } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'
    const res = await apis.getChannelPins(state.currentChannelId)
    commit.setPinnedMessages(res.data)
  },
  async fetchChannelLatestMessage(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (!state.currentChannelId) throw 'no channel id'

    const { messages } = await dispatch.fetchMessagesByChannelId({
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
    const content =
      rootState.entities.messages.messagesMap.get(messageId)?.content ?? ''

    const rendered = await render(content)

    const filePromises = rendered.embeddings.filter(isFile).map(async e => {
      try {
        await rootDispatch.entities.messages.fetchFileMetaData({
          fileId: e.id
        })
      } catch {
        // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
      }
    })
    const messagePromises = rendered.embeddings
      .filter(isMessage)
      .map(async e => {
        try {
          const message = await rootDispatch.entities.messages.fetchMessage({
            messageId: e.id
          })

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
          await rootDispatch.entities.messages.fetchOgpData({
            url: e.url
          })
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
    const { commit, dispatch, rootCommit } = messagesViewActionContext(context)
    await dispatch.renderMessageContent(payload.message.id)
    commit.addMessageId(payload.message.id)
    // TODO
    rootCommit.domain.me.deleteUnreadChannel(payload.message.channelId)
  },
  async updateAndRenderMessageId(context, payload: { message: Message }) {
    const { commit, dispatch, rootCommit } = messagesViewActionContext(context)
    await dispatch.renderMessageContent(payload.message.id)
    commit.updateMessageId(payload.message.id)
    // TODO
    rootCommit.domain.me.deleteUnreadChannel(payload.message.channelId)
  },

  setCurrentViewers(context, viewers: ChannelViewer[]) {
    const { commit } = messagesViewActionContext(context)
    commit.setCurrentViewers(viewers)
  },
  onChannelMessageCreated(context, message: Message) {
    const { state, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId !== message.channelId) return
    dispatch.addAndRenderMessage({ message })
  },
  onChannelMessageUpdated(context, message: Message) {
    const { state, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId !== message.channelId) return
    dispatch.updateAndRenderMessageId({ message })
  },
  onChannelMessageDeleted(context, messageId: MessageId) {
    const { commit } = messagesViewActionContext(context)
    commit.deleteMessageId(messageId)
    commit.removePinnedMessage(messageId)
  },
  async onChangeMessagePinned(
    context,
    { message, pinned }: { message: Message; pinned: boolean }
  ) {
    const { state, commit } = messagesViewActionContext(context)
    if (state.currentChannelId !== message.channelId) return

    if (!pinned) {
      commit.removePinnedMessage(message.id)
      return
    }

    const [{ data: pin }, shared] = await getPin(message.id)
    if (shared) return

    commit.addPinnedMessage({
      userId: pin.userId,
      message,
      pinnedAt: pin.pinnedAt
    })
  },
  async onClipFolderMessageAdded(
    context,
    { folderId, messageId }: { folderId: ClipFolderId; messageId: MessageId }
  ) {
    const { state, dispatch, rootDispatch } = messagesViewActionContext(context)
    if (state.currentClipFolderId !== folderId) return

    const message = await rootDispatch.entities.messages.fetchMessage({
      messageId
    })
    await dispatch.addAndRenderMessage({ message })
  },
  onClipFolderMessageDeleted(
    context,
    { folderId, messageId }: { folderId: ClipFolderId; messageId: MessageId }
  ) {
    const { state, commit } = messagesViewActionContext(context)
    if (state.currentClipFolderId !== folderId) return
    commit.deleteMessageId(messageId)
  }
})
