import { createDefineListeners } from '../../utils/defineListeners'
import { wsListener } from '/@/lib/websocket'
import { formatSnakeKeysToCamelShallow } from '/@/lib/basic/record'
import { WebRTCUserState } from '@traptitech/traq'
import { rtc } from '.'

export const defineWsListeners = createDefineListeners<typeof rtc>()(
  wsListener,
  (listener, { dispatch }) => {
    listener.on('USER_WEBRTC_STATE_CHANGED', dataSnake => {
      const data = formatSnakeKeysToCamelShallow(dataSnake) as WebRTCUserState
      dispatch.updateRTCState(data)
    })

    listener.on('reconnect', () => {
      dispatch.fetchRTCState({ ignoreCache: true })
    })
  }
)
