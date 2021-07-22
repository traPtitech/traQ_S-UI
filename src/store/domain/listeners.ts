import { createDefineListeners } from '../utils/defineListeners'
import { wsListener } from '/@/lib/websocket'
import { domain } from '.'

export const defineWsListeners = createDefineListeners<typeof domain>()(
  wsListener,
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
