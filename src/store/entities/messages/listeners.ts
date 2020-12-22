import { wsListener } from '@/lib/websocket'
import { defineSubModuleListeners } from '@/store/utils/defineListeners'
import _store from '@/_store'
import { messageMitt } from '.'

export const listeners = defineSubModuleListeners(
  wsListener,
  'entities',
  'messages',
  (listener, { dispatch }) => {
    listener.on('MESSAGE_CREATED', async ({ id }) => {
      const message = await dispatch.fetchMessage({ messageId: id })

      if (!message) return
      // TODO: eventを使うようにする
      await _store.dispatch.domain.messagesView.addAndRenderMessage({ message })
    })
    listener.on('MESSAGE_UPDATED', ({ id }) => {
      dispatch.fetchMessage({ messageId: id })
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

    // TODO: うつす
    listener.on(
      'CLIP_FOLDER_MESSAGE_ADDED',
      async ({ message_id, folder_id }) => {
        const currentPrimaryView = _store.state.ui.mainView.primaryView
        if (
          currentPrimaryView.type !== 'clips' ||
          currentPrimaryView.clipFolderId !== folder_id
        ) {
          return
        }

        const message = await dispatch.fetchMessage({ messageId: message_id })
        if (!message) return
        await _store.dispatch.domain.messagesView.addAndRenderMessage({
          message
        })
      }
    )

    listener.on('reconnect', () => {
      messageMitt.emit('reconnect')
    })
  }
)
