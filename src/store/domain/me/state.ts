import { UserId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'

export interface S {
  id: UserId
  webhooks: WebhookId[]
  stampHistory: StampId[]

  // ここら辺はハッシュマップで持ちたい
  unreadChannels: ChannelId[]
  subscribedChannels: ChannelId[]
  notifiedChannels: ChannelId[]
}

export const state: S = {
  id: '',
  webhooks: [],
  stampHistory: [],
  unreadChannels: [],
  subscribedChannels: [],
  notifiedChannels: []
}
