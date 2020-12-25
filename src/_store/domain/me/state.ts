import { StampId, ChannelId, DMChannelId } from '@/types/entity-ids'
import {
  UnreadChannel,
  MyUserDetail,
  ChannelSubscribeLevel
} from '@traptitech/traq'

export interface S {
  detail?: Readonly<MyUserDetail>
  stampHistory: Map<StampId, Date>

  unreadChannelsMap: Map<ChannelId | DMChannelId, UnreadChannel>
  staredChannelSet: Set<ChannelId>
  subscriptionMap: Map<ChannelId, ChannelSubscribeLevel>
}

export const state: S = {
  detail: undefined,
  stampHistory: new Map(),
  unreadChannelsMap: new Map(),
  staredChannelSet: new Set(),
  subscriptionMap: new Map()
}
