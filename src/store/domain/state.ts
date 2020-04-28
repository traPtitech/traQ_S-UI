import { ChannelId, UserId } from '@/types/entity-ids'
import { ActivityTimelineMessage, UserDetail } from '@traptitech/traq'
import { ChannelState } from './index'

export interface S {
  /**
   * アクティビティ
   * 新しいもの順
   */
  activityTimeline: ActivityTimelineMessage[]
  activityTimelineChannelMap: Record<
    ChannelId,
    ActivityTimelineMessage | undefined
  >
  channelStateMap: Record<ChannelId, ChannelState | undefined>
  onlineUsers: UserId[]
  userDetails: Record<UserId, UserDetail | undefined>

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  activityTimeline: [],
  activityTimelineChannelMap: {},
  channelStateMap: {},
  onlineUsers: [],
  userDetails: {},
  channelStateUpdateHistory: []
}
