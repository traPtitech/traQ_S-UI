import { createDefineListeners } from '../../utils/defineListeners'
import { messageMitt } from '/@/vuex/entities/messages'
import { wsListener } from '/@/lib/websocket'
import { messagesView } from '.'

export const defineWsListeners = createDefineListeners<typeof messagesView>()(
  wsListener,
  (listener, { dispatch }) => {
    listener.on('CHANNEL_VIEWERS_CHANGED', ({ viewers }) => {
      dispatch.setCurrentViewers(viewers)
    })

    // 再接続時の再取得はmessagesFetcherで行う
  }
)

export const defineMessageListeners = createDefineListeners<
  typeof messagesView
>()(messageMitt, (listener, { dispatch }) => {
  listener.on('updateMessage', message => {
    dispatch.onChannelMessageUpdated(message)
  })
  listener.on('deleteMessage', messageId => {
    dispatch.onChannelMessageDeleted(messageId)
  })
  listener.on('changeMessagePinned', ({ message, pinned }) => {
    dispatch.onChangeMessagePinned({ message, pinned })
  })
})
