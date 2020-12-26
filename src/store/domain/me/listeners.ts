import { defineSubModuleListeners } from '../../utils/defineListeners'
import { wsListener } from '@/lib/websocket'
import { messageMitt } from '@/store/entities/messages'

export const wsListeners = defineSubModuleListeners(
  wsListener,
  'domain',
  'me',
  (listener, { dispatch }) => {
    listener.on('MESSAGE_READ', ({ id }) => {
      dispatch.onChannelRead(id)
    })

    listener.on('CHANNEL_STARED', ({ id }) => {
      dispatch.onAddStaredChannel(id)
    })
    listener.on('CHANNEL_DELETED', ({ id }) => {
      dispatch.onDeleteStaredChannel(id)
    })

    listener.on('reconnect', () => {
      dispatch.fetchUnreadChannels()
      dispatch.fetchStaredChannels()
      dispatch.fetchSubscriptions()
    })
  }
)

export const messageListeners = defineSubModuleListeners(
  messageMitt,
  'domain',
  'me',
  (listener, { dispatch }) => {
    listener.on('addMessage', message => {
      dispatch.onMessageCreated(message)
    })
  }
)
