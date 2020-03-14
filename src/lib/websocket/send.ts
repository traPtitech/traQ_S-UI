import { ws } from './index'
import { ChannelViewerStateEnum } from '@/lib/api'
import { ChannelId } from '@/types/entity-ids'

type WebSocketCommand = typeof VIEWSTATE_COMMAND

const sendWebSocket = (
  command: WebSocketCommand,
  ...args: readonly string[]
): void => {
  if (ws === undefined) {
    throw new Error('WebSocket is not connected')
  }
  ws.send([command, ...args].join(':'))
}

const VIEWSTATE_COMMAND = 'viewstate'

type ChangeViewStateFunction = {
  (channelId: ChannelId, viewState: ChannelViewerStateEnum): void
  (channelId: null): void
}

export const changeViewState: ChangeViewStateFunction = (
  channelId: ChannelId | null,
  viewState?: ChannelViewerStateEnum
): void => {
  if (channelId === null) {
    sendWebSocket(VIEWSTATE_COMMAND, 'null')
  } else {
    sendWebSocket(VIEWSTATE_COMMAND, channelId, viewState!)
  }
}
