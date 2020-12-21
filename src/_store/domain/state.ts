import { ChannelId, UserId } from '@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'
import { ChannelState } from './index'

export interface S {
  channelStateMap: Record<ChannelId, ChannelState | undefined>
  onlineUsers: UserId[]
  userDetails: Record<UserId, UserDetail | undefined>

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  channelStateMap: {},
  onlineUsers: [],
  userDetails: {},
  channelStateUpdateHistory: []
}
