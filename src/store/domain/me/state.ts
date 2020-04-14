import { WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import { UnreadChannel, MyUserDetail } from '@traptitech/traq'
import { SubscriptionLevel } from '.'

export interface S {
  detail?: MyUserDetail
  webhooks: WebhookId[]
  stampHistory: Record<StampId, Date>

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  staredChannelSet: Record<ChannelId, true>
  subscriptionMap: Record<ChannelId, SubscriptionLevel>
}

export const state: S = {
  detail: undefined,
  webhooks: [],
  stampHistory: {},
  unreadChannelsSet: {},
  staredChannelSet: {},
  subscriptionMap: {}
}
