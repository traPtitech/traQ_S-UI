import { WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import {
  UnreadChannel,
  MyUserDetail,
  ChannelSubscribeLevel
} from '@traptitech/traq'

export interface S {
  detail?: MyUserDetail
  webhooks: WebhookId[]
  stampHistory: Record<StampId, Date>

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  staredChannelSet: Record<ChannelId, true>
  subscriptionMap: Record<ChannelId, ChannelSubscribeLevel>
}

export const state: S = {
  detail: undefined,
  webhooks: [],
  stampHistory: {},
  unreadChannelsSet: {},
  staredChannelSet: {},
  subscriptionMap: {}
}

export interface StampHistoryEntry {
  /**
   * スタンプUUID
   * @type {StampId}
   * @memberof StampHistoryEntry
   */
  stampId: StampId
  /**
   * 使用日時
   * @type {Date}
   * @memberof StampHistoryEntry
   */
  datetime: Date
}
