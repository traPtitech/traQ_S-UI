import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messages } from '.'
import { ActionContext } from 'vuex'
import { FileInfo, Message, MessageStamp } from '@traptitech/traq'
import { FileId, MessageId } from '@/types/entity-ids'
import { createSingleflight } from '@/lib/async'
import apis from '@/lib/apis'
import {
  MessageStampedEvent,
  MessageUnstampedEvent
} from '@/lib/websocket/events'

export const messagesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messages)

const getMessage = createSingleflight(apis.getMessage.bind(apis))
const getFileMeta = createSingleflight(apis.getFileMeta.bind(apis))

export const actions = defineActions({
  async fetchMessage(
    context,
    { messageId, force = false }: { messageId: MessageId; force?: boolean }
  ): Promise<Message> {
    const { state, commit } = messagesActionContext(context)
    if (!force && state.messagesMap.has(messageId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return state.messagesMap.get(messageId)!
    }

    const [{ data: message }, shared] = await getMessage(messageId)
    if (!shared) {
      commit.setMessage(message)
    }
    return message
  },
  extendMessagesMap(context, messages: Message[]) {
    const { commit } = messagesActionContext(context)
    commit.extendMessagesMap(messages)
  },
  deleteMessage(context, messageId: MessageId) {
    const { commit } = messagesActionContext(context)
    commit.deleteMessage(messageId)
  },
  addMessageStamp(context, e: MessageStampedEvent) {
    const { state, commit } = messagesActionContext(context)
    if (!state.messagesMap.has(e.message_id)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = state.messagesMap.get(e.message_id)!

    // 既に押されているスタンプは更新、新規は追加
    if (
      stamps.some(
        stamp => stamp.stampId === e.stamp_id && stamp.userId === e.user_id
      )
    ) {
      const newStamps = stamps.map(stamp =>
        stamp.stampId === e.stamp_id && stamp.userId === e.user_id
          ? { ...stamp, count: e.count, createdAt: e.created_at }
          : stamp
      )
      commit.updateMessageStamps({ messageId: e.message_id, stamps: newStamps })
    } else {
      const stamp: MessageStamp = {
        userId: e.user_id,
        stampId: e.stamp_id,
        count: e.count,
        createdAt: e.created_at,
        updatedAt: e.created_at
      }
      const newStamps = [...stamps, stamp]
      commit.updateMessageStamps({ messageId: e.message_id, stamps: newStamps })
    }
  },
  deleteMessageStamp(context, e: MessageUnstampedEvent) {
    const { state, commit } = messagesActionContext(context)
    if (!state.messagesMap.has(e.message_id)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = state.messagesMap.get(e.message_id)!

    const newStamps = stamps.filter(
      stamp => !(stamp.stampId === e.stamp_id && stamp.userId === e.user_id)
    )

    commit.updateMessageStamps({ messageId: e.message_id, stamps: newStamps })
  },
  setMessagePinnedState(
    context,
    { messageId, pinned }: { messageId: MessageId; pinned: boolean }
  ) {
    const { commit } = messagesActionContext(context)
    commit.setMessagePinnedState({ messageId, pinned })
  },

  async fetchFileMetaData(
    context,
    { fileId, force = false }: { fileId: FileId; force?: boolean }
  ): Promise<FileInfo | undefined> {
    const { state, commit } = messagesActionContext(context)
    if (!force && state.fileMetaDataMap.has(fileId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return state.fileMetaDataMap.get(fileId)!
    }

    const [{ data: fileMetaData }, shared] = await getFileMeta(fileId)
    if (!shared) {
      commit.setFileMetaData(fileMetaData)
    }
    return fileMetaData
  }
})
