import { StampId, ChannelId, DMChannelId } from '@/types/entity-ids'
import {
  UnreadChannel,
  ChannelSubscribeLevel,
  MyUserDetail
} from '@traptitech/traq'

export interface S {
  detail?: Readonly<MyUserDetail>

  stampHistory: Map<StampId, Date>
  stampHistoryFetched: boolean
  unreadChannelsMap: Map<ChannelId | DMChannelId, UnreadChannel>
  unreadChannelsMapFetched: boolean
  staredChannelSet: Set<ChannelId>
  staredChannelSetFetched: boolean
  subscriptionMap: Map<ChannelId, ChannelSubscribeLevel>
  subscriptionMapFetched: boolean
}

export const state: S = {
  detail: undefined,

  stampHistory: new Map(),
  stampHistoryFetched: false,
  unreadChannelsMap: new Map(),
  unreadChannelsMapFetched: false,
  staredChannelSet: new Set(),
  staredChannelSetFetched: false,
  subscriptionMap: new Map(),
  subscriptionMapFetched: false
}
