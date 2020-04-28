import { ws, wsConnectionPromise } from './index'
import { ChannelViewState, WebRTCUserStateSessions } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'

type WebSocketCommand = 'viewstate' | 'rtcstate' | 'timeline_streaming'

const sendWebSocket = async (
  ...command: readonly [WebSocketCommand, ...string[]]
): Promise<void> => {
  if (ws === undefined) {
    throw new Error('WebSocket is not connected')
  }
  await wsConnectionPromise
  if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
    throw new Error('WebSocket is already in CLOSING or CLOSED state.')
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
    return sendWebSocket(VIEWSTATE_COMMAND, '')
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
    ...states.flatMap(s => [s.state, s.sessionId]),
    '' // 終端の:をつける
  )
}

const TIMELINE_STREAMING_COMMAND = 'timeline_streaming'

type TimelineStreamingType = 'on' | 'off' | 'true' | 'false'

const changeTimelineStreamingState = (type: TimelineStreamingType) => {
  return sendWebSocket(TIMELINE_STREAMING_COMMAND, type)
}

export const setTimelineStreamingState = (type: boolean) => {
  return changeTimelineStreamingState(type ? 'on' : 'off')
}
