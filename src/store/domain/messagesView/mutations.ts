import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, MessageId } from '@/types/entity-ids'

export const mutations = defineMutations<S>()({
  setCurrentChannelId(state, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId
  },
  setCurrentOffset(state, currentOffset: number) {
    state.currentOffset = currentOffset
  },
  setMessageIds(state, messageIds: MessageId[]) {
    state.messageIds = messageIds
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
  setIsReachedEnd(state, isReachedEnd: boolean) {
    state.isReachedEnd = isReachedEnd
  }
})
