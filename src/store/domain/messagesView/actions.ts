import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { Message } from '@traptitech/traq'
import { render } from '@/lib/markdown'

export const messagesViewActionContext = (context: any) =>
  moduleActionContext(context, messagesView)

export const actions = defineActions({
  async changeCurrentChannel(context, channelId: ChannelId) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId === channelId) return

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
    const messageIds = messages.map((message: Message) => message.id ?? '')
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([...messageIds, ...state.messageIds])
  },
  async renderMessageContent(context, messageId: string) {
    const { commit, rootState } = messagesViewActionContext(context)
    const content = rootState.entities.messages[messageId].content ?? ''
    const renderedContent = render(content)
    commit.addRenderedContent({ messageId, renderedContent })
  }
})
