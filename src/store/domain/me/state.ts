import { UserId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import { UnreadChannel } from '@traptitech/traq'

export interface S {
  id: UserId
  webhooks: WebhookId[]
  stampHistory: StampId[]

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  subscribedChannels: ChannelId[]
  notifiedChannels: ChannelId[]
}

export const state: S = {
  id: '',
  webhooks: [],
  stampHistory: [],
  unreadChannelsSet: {},
  subscribedChannels: [],
  notifiedChannels: []
}
