import { StampId, ChannelId, DMChannelId } from '@/types/entity-ids'
import {
  UnreadChannel,
  MyUserDetail,
  ChannelSubscribeLevel
} from '@traptitech/traq'

export interface S {
  detail?: Readonly<MyUserDetail>
  stampHistory: Record<StampId, Date>

  unreadChannelsSet: Record<ChannelId | DMChannelId, UnreadChannel>
  staredChannelSet: Record<ChannelId, true>
  subscriptionMap: Record<ChannelId, ChannelSubscribeLevel>
}

export const state: S = {
  detail: undefined,
  stampHistory: {},
  unreadChannelsSet: {},
  staredChannelSet: {},
  subscriptionMap: {}
}
