import { ChannelId, UserGroupId, UserId } from '@/types/entity-ids'
import { Channel, DMChannel, User, UserGroup } from '@traptitech/traq'

export type S = {
  usersMap: Map<UserId, User>
  usersMapFetched: boolean
  userGroupsMap: Map<UserGroupId, UserGroup>
  userGroupsMapFetched: boolean
  channelsMap: Map<ChannelId, Channel>
  dmChannelsMap: Map<ChannelId, DMChannel>
  bothChannelsMapFetched: boolean
}

export const state: S = {
  usersMap: new Map(),
  usersMapFetched: false,
  userGroupsMap: new Map(),
  userGroupsMapFetched: false,
  channelsMap: new Map(),
  dmChannelsMap: new Map(),
  bothChannelsMapFetched: false
}
