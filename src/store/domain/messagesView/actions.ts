import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId, StampId } from '@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import apis from '@/lib/api'
import { changeViewState } from '@/lib/websocket'
import { embeddingExtractor } from '@/lib/embeddingExtractor'

export const messagesViewActionContext = (context: any) =>
  moduleActionContext(context, messagesView)

export const actions = defineActions({
  async changeCurrentChannel(
    context,
    payload: { channelId: ChannelId; entryMessageId?: MessageId }
  ) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId === payload.channelId) return

    changeViewState(payload.channelId, ChannelViewState.Monitoring)
    commit.setCurrentChannelId(payload.channelId)
    commit.unsetLoadedMessageOldestDate()
    commit.unsetLoadedMessageLatestDate()
    commit.setMessageIds([])
    commit.setRenderedContent({})

    if (payload.entryMessageId) {
      commit.setIsReachedEnd(false)
      commit.setIsReachedLatest(false)
      commit.setEntryMessageId(payload.entryMessageId)
      commit.setLastLoadingDirection('around')
      await dispatch.fetchAndRenderChannelMessageAroundEntryMessage(
        payload.entryMessageId
      )
      commit.setIsInitialLoad(true)
    } else {
      commit.setIsReachedEnd(false)
      commit.setIsReachedLatest(true)
      commit.unsetEntryMessageId()
      commit.setLastLoadingDirection('latest')
      await dispatch.fetchAndRenderChannelFormerMessages()
      commit.setIsInitialLoad(true)
    }
  },

  /** 読み込まれているメッセージより前のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelFormerMessages(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    const messageIds = await dispatch.fetchChannelFormerMessages()
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([
      ...new Set([...messageIds.reverse(), ...state.messageIds])
    ])
  },

  /** 読み込まれているメッセージより後のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelLatterMessages(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    const messageIds = await dispatch.fetchChannelLatterMessages()
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([...new Set([...state.messageIds, ...messageIds])])
  },

  /** エントリーメッセージ周辺のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelMessageAroundEntryMessage(
    context,
    entryMessageId: string
  ) {
    const {
      commit,
      dispatch,
      rootState,
      rootDispatch
    } = messagesViewActionContext(context)
    const entryMessage =
      rootState.entities.messages[entryMessageId] ??
      (await rootDispatch.entities.fetchMessage(entryMessageId))

    if (!entryMessage) {
      return
    }

    const date = new Date(entryMessage.createdAt)
    commit.setLoadedMessageLatestDate(date)
    commit.setLoadedMessageOldestDate(date)

    const [formerMessageIds, latterMessageIds] = await Promise.all([
      dispatch.fetchChannelFormerMessages(),
      dispatch.fetchChannelLatterMessages()
    ])
    const messageIds = [
      ...new Set([
        ...formerMessageIds.reverse(),
        entryMessageId,
        ...latterMessageIds
      ])
    ]
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds(messageIds)
  },

  /** 読み込まれているメッセージより前のメッセージを取得し、idを返す */
  async fetchChannelFormerMessages(context): Promise<ChannelId[]> {
    const { state, commit, rootDispatch } = messagesViewActionContext(context)
    if (state.isReachedEnd) return []
    const {
      messages,
      hasMore
    } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: state.fetchLimit,
      order: 'desc',
      until: state.loadedMessageOldestDate
    })

    if (!hasMore) {
      commit.setIsReachedEnd(true)
    }

    const oldestMessage = messages[messages.length - 1]
    const oldestMessageDate = new Date(oldestMessage.createdAt)
    if (
      !state.loadedMessageOldestDate ||
      oldestMessageDate < state.loadedMessageOldestDate
    ) {
      commit.setLoadedMessageOldestDate(oldestMessageDate)
    }

    return messages.map(message => message.id)
  },

  /** 読み込まれているメッセージより後のメッセージを取得し、idを返す */
  async fetchChannelLatterMessages(context): Promise<ChannelId[]> {
    const { state, commit, rootDispatch } = messagesViewActionContext(context)
    if (state.isReachedLatest) return []
    const {
      messages,
      hasMore
    } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: state.fetchLimit,
      order: 'asc',
      since: state.loadedMessageLatestDate
    })

    if (!hasMore) {
      commit.setIsReachedLatest(true)
    }

    const latestMessage = messages[messages.length - 1]
    const latestMessageDate = new Date(latestMessage.createdAt)
    if (
      !state.loadedMessageLatestDate ||
      latestMessageDate > state.loadedMessageLatestDate
    ) {
      commit.setLoadedMessageLatestDate(latestMessageDate)
    }

    return messages.map(message => message.id)
  },

  async fetchChannelLatestMessage(context) {
    const { state, commit, dispatch, rootDispatch } = messagesViewActionContext(
      context
    )
    const { messages } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: 1,
      offset: 0
    })
    if (messages.length !== 1) return
    commit.setLoadedMessageLatestDate(new Date(messages[0].createdAt))
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
        if (e.type === 'file') {
          return rootDispatch.entities.fetchFileMetaByFileId(e.id)
        }
        if (e.type === 'message') {
          return rootDispatch.entities.fetchMessage(e.id).then(message => {
            // テキスト部分のみレンダリング
            const extracted = embeddingExtractor(message.content)
            const renderedContent = render(extracted.text)
            commit.addRenderedContent({
              messageId: message.id,
              renderedContent
            })
          })
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
  addStamp(context, payload: { messageId: MessageId; stampId: StampId }) {
    apis.addMessageStamp(payload.messageId, payload.stampId)
  },
  removeStamp(context, payload: { messageId: MessageId; stampId: StampId }) {
    apis.removeMessageStamp(payload.messageId, payload.stampId)
  }
})
