import { FileId, MessageId } from '/@/types/entity-ids'
import { FileInfo, Message, MessageStamp, Ogp } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { messageMitt } from '.'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setMessage(state, message: Message) {
    state.messagesMap.set(message.id, message)
  },
  extendMessagesMap(state, messages: Message[]) {
    state.messagesMap = new Map([
      ...state.messagesMap,
      ...messages.map(message => [message.id, message] as const)
    ])
  },
  deleteMessage(state, messageId: MessageId) {
    state.messagesMap.delete(messageId)

    messageMitt.emit('deleteMessage', messageId)
  },
  updateMessageStamps(
    state,
    { messageId, stamps }: { messageId: MessageId; stamps: MessageStamp[] }
  ) {
    const message = state.messagesMap.get(messageId)
    if (!message) return
    message.stamps = stamps
  },
  setMessagePinnedState(
    state,
    { messageId, pinned }: { messageId: MessageId; pinned: boolean }
  ) {
    const message = state.messagesMap.get(messageId)
    if (!message) return
    message.pinned = pinned

    messageMitt.emit('changeMessagePinned', { message, pinned })
  },

  setFileMetaData(state, fileMetaData: FileInfo) {
    state.fileMetaDataMap.set(fileMetaData.id, fileMetaData)
  },
  deleteFileMetaData(state, fileId: FileId) {
    state.fileMetaDataMap.delete(fileId)
  },

  setOgpData(state, { url, ogpData }: { url: string; ogpData: Ogp }) {
    state.ogpDataMap.set(url, ogpData)
  }
})
