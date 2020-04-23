import { ws, wsConnectionPromise } from './index'
import { ChannelViewState, WebRTCUserStateSessions } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'

type WebSocketCommand = 'viewstate' | 'rtcstate'

const sendWebSocket = async (
  ...command: readonly [WebSocketCommand, ...string[]]
): Promise<void> => {
  await wsConnectionPromise
  if (ws === undefined) {
    throw new Error('WebSocket is not connected')
  }
  ws.send(command.join(':'))
}

const VIEWSTATE_COMMAND = 'viewstate'

type ChangeViewStateFunction = {
  (channelId: ChannelId, viewState: ChannelViewState): void
  (channelId: null): void
}

export const changeViewState: ChangeViewStateFunction = (
  channelId: ChannelId | null,
  viewState?: ChannelViewState
): Promise<void> => {
  if (channelId === null) {
    return sendWebSocket(VIEWSTATE_COMMAND, 'null')
  } else {
    return sendWebSocket(VIEWSTATE_COMMAND, channelId, viewState!)
  }
}

const RTCSTATE_COMMAND = 'rtcstate'

export const changeRTCState = (
  channelId: ChannelId,
  states: WebRTCUserStateSessions[]
) => {
  if (states.length === 0) {
    return sendWebSocket(RTCSTATE_COMMAND, channelId, '')
  }
  return sendWebSocket(
    RTCSTATE_COMMAND,
    channelId,
    ...states.flatMap(s => [s.state, s.sessionId])
  )
}
