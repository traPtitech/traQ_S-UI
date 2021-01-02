import { defineListeners } from '../utils/defineListeners'
import { wsListener } from '@/lib/websocket'

export const listeners = defineListeners(
  wsListener,
  'domain',
  (listener, { dispatch }) => {
    listener.on('USER_ONLINE', ({ id }) => {
      dispatch.addOnlineUser(id)
    })
    listener.on('USER_OFFLINE', ({ id }) => {
      dispatch.deleteOnlineUser(id)
    })

    listener.on('reconnect', () => {
      dispatch.fetchOnlineUsers({ ignoreCache: true })
    })
  }
)
