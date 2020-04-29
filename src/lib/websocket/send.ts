import { ws } from './index'
import { ChannelViewState, WebRTCUserStateSessions } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'

export type WebSocketCommand = 'viewstate' | 'rtcstate' | 'timeline_streaming'

const VIEWSTATE_COMMAND = 'viewstate'

type ChangeViewStateFunction = {
  (channelId: ChannelId, viewState: ChannelViewState): void
  (channelId: null): void
}

export const changeViewState: ChangeViewStateFunction = (
  channelId: ChannelId | null,
  viewState?: ChannelViewState
) => {
  if (channelId === null) {
    ws.sendCommand(VIEWSTATE_COMMAND, '')
  } else {
    ws.sendCommand(VIEWSTATE_COMMAND, channelId, viewState!)
  }
}

const RTCSTATE_COMMAND = 'rtcstate'

export const changeRTCState = (
  channelId: ChannelId,
  states: WebRTCUserStateSessions[]
) => {
  if (states.length === 0) {
    ws.sendCommand(RTCSTATE_COMMAND, channelId, '')
  }
  ws.sendCommand(
    RTCSTATE_COMMAND,
    channelId,
    ...states.flatMap(s => [s.state, s.sessionId]),
    '' // 終端の:をつける
  )
}

const TIMELINE_STREAMING_COMMAND = 'timeline_streaming'

type TimelineStreamingType = 'on' | 'off' | 'true' | 'false'

const changeTimelineStreamingState = (type: TimelineStreamingType) => {
  return ws.sendCommand(TIMELINE_STREAMING_COMMAND, type)
}

export const setTimelineStreamingState = (type: boolean) => {
  return changeTimelineStreamingState(type ? 'on' : 'off')
}
