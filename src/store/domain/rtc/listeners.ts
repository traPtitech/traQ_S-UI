import { defineSubModuleListeners } from '../../utils/defineListeners'
import { wsListener } from '@/lib/websocket'
import { formatSnakeKeysToCamelShallow } from '@/lib/util/record'
import { WebRTCUserState } from '@traptitech/traq'

export const listeners = defineSubModuleListeners(
  wsListener,
  'domain',
  'rtc',
  (listener, { dispatch }) => {
    listener.on('USER_WEBRTC_STATE_CHANGED', dataSnake => {
      const data = formatSnakeKeysToCamelShallow(dataSnake) as WebRTCUserState
      dispatch.updateRTCState(data)
    })

    listener.on('reconnect', () => {
      dispatch.fetchRTCState({ force: true })
    })
  }
)
