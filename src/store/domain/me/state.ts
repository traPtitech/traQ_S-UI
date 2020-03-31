import { WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import { UnreadChannel, MyUserDetail } from '@traptitech/traq'

export interface S {
  detail?: MyUserDetail
  webhooks: WebhookId[]
  stampHistory: StampId[]

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  subscribedChannels: ChannelId[]
  notifiedChannels: ChannelId[]
}

export const state: S = {
  detail: undefined,
  webhooks: [],
  stampHistory: [],
  unreadChannelsSet: {},
  subscribedChannels: [],
  notifiedChannels: []
}
