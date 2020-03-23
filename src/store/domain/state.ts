import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import { ActivityTimelineMessage } from '@traptitech/traq'
import { ChannelState } from './index'

export interface S {
  channelActivity: ActivityTimelineMessage[]
  messageActivity: MessageId[]
  channelStateMap: Record<ChannelId, ChannelState>
  onlineUsers: UserId[]

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  channelActivity: [],
  messageActivity: [],
  channelStateMap: {},
  onlineUsers: [],
  channelStateUpdateHistory: []
}
