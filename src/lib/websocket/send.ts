import { ws } from './index'
import { ChannelViewState } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'

type WebSocketCommand = 'viewstate'

const sendWebSocket = (
  ...command: readonly [WebSocketCommand, ...string[]]
): void => {
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
): void => {
  if (channelId === null) {
    sendWebSocket(VIEWSTATE_COMMAND, 'null')
  } else {
    sendWebSocket(VIEWSTATE_COMMAND, channelId, viewState!)
  }
}
