import { wsListener } from '@/lib/websocket'
import { defineSubModuleListeners } from '@/store/utils/defineListeners'
import { messageMitt } from '.'

export const listeners = defineSubModuleListeners(
  wsListener,
  'entities',
  'messages',
  (listener, { dispatch }) => {
    listener.on('MESSAGE_CREATED', async ({ id }) => {
      const message = await dispatch.fetchMessage({ messageId: id })
      messageMitt.emit('addMessage', message)
    })
    listener.on('MESSAGE_UPDATED', async ({ id }) => {
      const message = await dispatch.fetchMessage({
        messageId: id,
        ignoreCache: true
      })
      messageMitt.emit('updateMessage', message)
    })
    listener.on('MESSAGE_DELETED', ({ id }) => {
      dispatch.deleteMessage(id)
    })
    listener.on('MESSAGE_STAMPED', e => {
      dispatch.addMessageStamp(e)
    })
    listener.on('MESSAGE_UNSTAMPED', e => {
      dispatch.deleteMessageStamp(e)
    })
    listener.on('MESSAGE_PINNED', ({ message_id }) => {
      dispatch.setMessagePinnedState({ messageId: message_id, pinned: true })
    })
    listener.on('MESSAGE_UNPINNED', ({ message_id }) => {
      dispatch.setMessagePinnedState({ messageId: message_id, pinned: false })
    })

    // reconnect時のメッセージの再取得処理はそれぞれの方で行う

    listener.on('reconnect', () => {
      messageMitt.emit('reconnect')
    })
  }
)
