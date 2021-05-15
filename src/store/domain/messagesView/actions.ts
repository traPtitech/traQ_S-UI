import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId, ClipFolderId } from '@/types/entity-ids'
import { ChannelViewer, ChannelViewState, Message } from '@traptitech/traq'
import { render } from '@/lib/markdown/markdown'
import apis from '@/lib/apis'
import { changeViewState } from '@/lib/websocket'
import { ActionContext } from 'vuex'
import {
  isFile,
  isMessage,
  isExternalUrl
} from '@/lib/util/guard/embeddingOrUrl'
import { createSingleflight } from '@/lib/async'
import { unreadChannelsMapInitialFetchPromise } from '../me/promises'

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
    commit.unsetCurrentChannelId()
    commit.unsetCurrentClipFolderId()
    commit.unsetPinnedMessages()
    commit.unsetRenderedContent()
    commit.unsetCurrentViewers()
    commit.unsetUnreadSince()
  },
  async changeCurrentChannel(
    context,
    payload: {
      channelId: ChannelId
      entryMessageId?: MessageId
      isDM?: boolean
    }
  ) {
    const { state, commit, dispatch, rootState } =
      messagesViewActionContext(context)
    if (state.currentChannelId === payload.channelId) return

    // ここの二行は同時に実行されないとmessagesFetcherのrunWithIdentifierCheckに失敗する
    dispatch.resetViewState()
    commit.setCurrentChannelId(payload.channelId)

    // 未読を取得していないと未読を表示できないため
    await unreadChannelsMapInitialFetchPromise

    const unreadChannel = rootState.domain.me.unreadChannelsMap.get(
      payload.channelId
    )
    if (unreadChannel) {
      // 未読表示を**追加してから**未読を削除
      // 未読の削除は最新メッセージ読み込み完了時
      commit.setUnreadSince(unreadChannel.since)
    }

    dispatch.fetchPinnedMessages()
  },

  /** クリップフォルダに移行 */
  async changeCurrentClipFolder(context, clipFolderId: ClipFolderId) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentClipFolderId === clipFolderId) return

    // ここの二行は同時に実行されないとmessagesFetcherのrunWithIdentifierCheckに失敗する
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
  async renderMessageContent(context, messageId: string) {
    const { commit, rootState, rootDispatch } =
      messagesViewActionContext(context)
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
    const { state, commit, dispatch } = messagesViewActionContext(context)
    // すでに追加済みの場合は追加しない
    // https://github.com/traPtitech/traQ_S-UI/issues/1748
    if (state.messageIds.includes(payload.message.id)) return
    await dispatch.renderMessageContent(payload.message.id)
    commit.addMessageId(payload.message.id)
  },
  async updateAndRenderMessageId(context, payload: { message: Message }) {
    const { dispatch } = messagesViewActionContext(context)
    await dispatch.renderMessageContent(payload.message.id)
  },

  setCurrentViewers(context, viewers: ChannelViewer[]) {
    const { commit } = messagesViewActionContext(context)
    commit.setCurrentViewers(viewers)
  },
  onChannelMessageCreated(context, message: Message) {
    const { state, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId !== message.channelId) return
    if (!state.shouldRetriveMessageCreateEvent) return
    dispatch.addAndRenderMessage({ message })
  },
  onChannelMessageUpdated(context, message: Message) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId !== message.channelId) return
    dispatch.updateAndRenderMessageId({ message })
    commit.updatePinnedMessage(message)
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
  },

  syncViewState(context) {
    const { state } = messagesViewActionContext(context)
    if (state.currentChannelId) {
      changeViewState(
        state.currentChannelId,
        state.shouldRetriveMessageCreateEvent
          ? ChannelViewState.Monitoring
          : ChannelViewState.None
      )
    } else {
      changeViewState(null)
    }
  },
  async setShouldRetriveMessageCreateEvent(
    context,
    shouldRetriveMessageCreateEvent: boolean
  ) {
    const { rootState, rootDispatch, state, commit } =
      messagesViewActionContext(context)
    if (shouldRetriveMessageCreateEvent && state.currentChannelId) {
      // 未読を取得していないと未読を表示できないため (また既読にできないため)
      await unreadChannelsMapInitialFetchPromise

      const isUnreadChannel = rootState.domain.me.unreadChannelsMap.has(
        state.currentChannelId
      )
      if (isUnreadChannel) {
        // チャンネルを既読にする
        // (サーバーから削除すればwsから変更を受け取ることでローカルも変更される)
        apis.readChannel(state.currentChannelId)
        // ただし他端末で閲覧中の場合は未読に追加されないので
        // 既読イベントが送信されてこないのでローカルでも既読にする
        rootDispatch.domain.me.deleteUnreadChannel(state.currentChannelId)
      }
    }
    commit.setShouldRetriveMessageCreateEvent(shouldRetriveMessageCreateEvent)
  }
})
