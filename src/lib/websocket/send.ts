import { ws } from './index'
import type { ChannelViewState } from '@traptitech/traq'
import type { ChannelId } from '/@/types/entity-ids'

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ws.sendCommand(VIEWSTATE_COMMAND, channelId, viewState!)
  }
}

const TIMELINE_STREAMING_COMMAND = 'timeline_streaming'

type TimelineStreamingType = 'on' | 'off' | 'true' | 'false'

const changeTimelineStreamingState = (type: TimelineStreamingType) => {
  return ws.sendCommand(TIMELINE_STREAMING_COMMAND, type)
}

export const setTimelineStreamingState = (type: boolean) => {
  return changeTimelineStreamingState(type ? 'on' : 'off')
}
