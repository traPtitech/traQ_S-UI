import { wsListener } from '/@/lib/websocket'
import { createDefineListeners } from '/@/store/utils/defineListeners'
import { messageMitt, messages } from '.'

export const defineWsListeners = createDefineListeners<typeof messages>()(
  wsListener,
  (listener, { dispatch }) => {
    listener.on('MESSAGE_CREATED', async ({ id, is_citing }) => {
      const message = await dispatch.fetchMessage({ messageId: id })
      messageMitt.emit('addMessage', { message, isCiting: is_citing })
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
