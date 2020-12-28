import { defineSubModuleListeners } from '../../utils/defineListeners'

import { messageMitt } from '@/store/entities/messages'
import { wsListener } from '@/lib/websocket'

export const wsListeners = defineSubModuleListeners(
  wsListener,
  'domain',
  'messagesView',
  (listener, { dispatch }) => {
    listener.on('CHANNEL_VIEWERS_CHANGED', ({ viewers }) => {
      dispatch.setCurrentViewers(viewers)
    })

    listener.on('CLIP_FOLDER_MESSAGE_ADDED', ({ folder_id, message_id }) => {
      dispatch.onClipFolderMessageAdded({
        folderId: folder_id,
        messageId: message_id
      })
    })
    listener.on('CLIP_FOLDER_MESSAGE_DELETED', ({ folder_id, message_id }) => {
      dispatch.onClipFolderMessageDeleted({
        folderId: folder_id,
        messageId: message_id
      })
    })

    // 再接続時の再取得はmessagesFetcherで行う
  }
)

export const messageListeners = defineSubModuleListeners(
  messageMitt,
  'domain',
  'messagesView',
  (listener, { dispatch }) => {
    listener.on('addMessage', message => {
      dispatch.onChannelMessageCreated(message)
    })
    listener.on('updateMessage', message => {
      dispatch.onChannelMessageUpdated(message)
      // TODO: ピン止めの内容の更新
    })
    listener.on('deleteMessage', messageId => {
      dispatch.onChannelMessageDeleted(messageId)
    })
    listener.on('changeMessagePinned', ({ message, pinned }) => {
      dispatch.onChangeMessagePinned({ message, pinned })
    })
  }
)
