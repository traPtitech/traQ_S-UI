import { UserId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import {
  UnreadChannel,
  StampHistoryEntry,
  UserAccountState,
  UserTag
} from '@traptitech/traq'

export interface S {
  // MyUserDetail
  id: UserId
  bio: string
  groups: string[]
  tags: UserTag[]
  updatedAt: string
  lastOnline: string
  twitterId: string
  name: string
  displayName: string
  iconFileId: string
  bot: boolean
  state: UserAccountState
  permissions: string[]

  webhooks: WebhookId[]
  stampHistory: Record<StampId, Date>

  unreadChannelsSet: Record<ChannelId, UnreadChannel>
  staredChannelSet: Record<ChannelId, true>
  subscribedChannels: ChannelId[]
  notifiedChannels: ChannelId[]
}

export const state: S = {
  id: '',
  bio: '',
  groups: [],
  tags: [],
  updatedAt: '',
  lastOnline: '',
  twitterId: '',
  name: '',
  displayName: '',
  iconFileId: '',
  bot: false,
  state: 0,
  permissions: [],
  webhooks: [],
  stampHistory: {},
  unreadChannelsSet: {},
  staredChannelSet: {},
  subscribedChannels: [],
  notifiedChannels: []
}
