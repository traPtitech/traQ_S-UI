import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import { ActivityTimelineMessage, UserDetail } from '@traptitech/traq'
import { ChannelState } from './index'

export interface S {
  channelActivity: ActivityTimelineMessage[]
  messageActivity: MessageId[]
  channelStateMap: Record<ChannelId, ChannelState | undefined>
  onlineUsers: UserId[]
  userDetails: Record<UserId, UserDetail | undefined>

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  channelActivity: [],
  messageActivity: [],
  channelStateMap: {},
  onlineUsers: [],
  userDetails: {},
  channelStateUpdateHistory: []
}
