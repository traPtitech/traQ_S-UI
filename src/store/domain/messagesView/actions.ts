import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId, StampId } from '@/types/entity-ids'
import { Message, ChannelViewState } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import apis from '@/lib/api'
import { changeViewState } from '@/lib/websocket'
import { embeddingExtractor } from '@/lib/embeddingExtractor'

export const messagesViewActionContext = (context: any) =>
  moduleActionContext(context, messagesView)

export const actions = defineActions({
  async changeCurrentChannel(context, channelId: ChannelId) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId === channelId) return

    changeViewState(channelId, ChannelViewState.Monitoring)

    commit.setIsReachedEnd(false)
    commit.setCurrentChannelId(channelId)
    commit.setCurrentOffset(0)
    commit.setMessageIds([])
    commit.setRenderedContent({})

    dispatch.fetchChannelMessages()
  },
  async fetchChannelMessages(context) {
    const { state, commit, dispatch, rootDispatch } = messagesViewActionContext(
      context
    )
    if (state.isReachedEnd) return

    const {
      messages,
      hasMore
    } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: state.fetchLimit,
      offset: state.currentOffset
    })

    if (!hasMore) {
      commit.setIsReachedEnd(true)
    }
    commit.setCurrentOffset(state.currentOffset + state.fetchLimit)
    const messageIds: MessageId[] = messages.map(message => message.id)
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([...messageIds.reverse(), ...state.messageIds])
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
    commit.setCurrentOffset(state.currentOffset + 1)
    const messageId = messages[0].id
    await dispatch.renderMessageContent(messageId)
    commit.setMessageIds([...state.messageIds, messageId])
  },
  async renderMessageContent(context, messageId: string) {
    const { commit, rootState, rootDispatch } = messagesViewActionContext(
      context
    )
    const content = rootState.entities.messages[messageId].content ?? ''

    const extracted = embeddingExtractor(content)

    await Promise.all(
      extracted.embeddings.map(async e =>
        rootDispatch.entities.fetchFileMetaByFileId(e.id)
      )
    )

    const renderedContent = render(extracted.text)
    commit.addRenderedContent({ messageId, renderedContent })
    commit.addEmbededFile({ messageId, files: extracted.embeddings })
  },
  addStamp(context, payload: { messageId: MessageId; stampId: StampId }) {
    apis.addMessageStamp(payload.messageId, payload.stampId)
  },
  removeStamp(context, payload: { messageId: MessageId; stampId: StampId }) {
    apis.removeMessageStamp(payload.messageId, payload.stampId)
  }
})
