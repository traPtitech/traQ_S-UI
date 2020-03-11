import { ws } from './index'
import { ChannelViewerStateEnum } from '@/lib/api'
import { ChannelId } from '@/types/entity-ids'

const sendWebSocket = (command: readonly string[]): void => {
  if (ws === undefined) {
    throw new Error('WebSocket is not connected')
  }
  ws.send(command.join(':'))
}

const VIEWSTATE_EVENT = 'viewstate'

type ChangeViewStateFunction = {
  (channelId: ChannelId, viewState: ChannelViewerStateEnum): void
  (channelId: null): void
}

export const changeViewState: ChangeViewStateFunction = (
  channelId: ChannelId | null,
  viewState?: ChannelViewerStateEnum
): void => {
  if (channelId === null) {
    sendWebSocket([VIEWSTATE_EVENT, 'null'])
  } else {
    sendWebSocket([VIEWSTATE_EVENT, channelId, viewState!])
  }
}
