import { ChannelId, MessageId } from '@/types/entity-ids'
import { ActivityTimelineMessage } from '@traptitech/traq'
import { ChannelState } from './index'

export interface S {
  channelActivity: ActivityTimelineMessage[]
  messageActivity: MessageId[]
  channelStateMap: Record<ChannelId, ChannelState>

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  channelActivity: [],
  messageActivity: [],
  channelStateMap: {},
  channelStateUpdateHistory: []
}
