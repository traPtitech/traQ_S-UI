import { StampId, ChannelId, DMChannelId } from '@/types/entity-ids'
import { UnreadChannel, ChannelSubscribeLevel } from '@traptitech/traq'

export interface S {
  stampHistory: Map<StampId, Date>
  unreadChannelsMap: Map<ChannelId | DMChannelId, UnreadChannel>
  unreadChannelsMapFetched: boolean
  staredChannelSet: Set<ChannelId>
  subscriptionMap: Map<ChannelId, ChannelSubscribeLevel>
}

export const state: S = {
  stampHistory: new Map(),
  unreadChannelsMap: new Map(),
  unreadChannelsMapFetched: false,
  staredChannelSet: new Set(),
  subscriptionMap: new Map()
}
