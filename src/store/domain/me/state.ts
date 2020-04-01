import { UserId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import { UnreadChannel, StampHistoryEntry } from '@traptitech/traq'

export interface S {
  id: UserId
  webhooks: WebhookId[]
  stampHistory: Record<StampId, Date>

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  staredChannelSet: Record<ChannelId, true>
  subscribedChannels: ChannelId[]
  notifiedChannels: ChannelId[]
}

export const state: S = {
  id: '',
  webhooks: [],
  stampHistory: {},
  unreadChannelsSet: {},
  staredChannelSet: {},
  subscribedChannels: [],
  notifiedChannels: []
}
