import {
  ChannelId,
  ClipFolderId,
  StampId,
  UserGroupId,
  UserId
} from '@/types/entity-ids'
import {
  Channel,
  ClipFolder,
  DMChannel,
  Stamp,
  User,
  UserGroup
} from '@traptitech/traq'

export type S = {
  usersMap: Map<UserId, User>
  usersMapFetched: boolean
  userGroupsMap: Map<UserGroupId, UserGroup>
  userGroupsMapFetched: boolean
  channelsMap: Map<ChannelId, Channel>
  dmChannelsMap: Map<ChannelId, DMChannel>
  bothChannelsMapFetched: boolean
  clipFoldersMap: Map<ClipFolderId, ClipFolder>
  clipFoldersMapFetched: boolean
  stampsMap: Map<StampId, Stamp>
  stampsMapFetched: boolean
}

export const state: S = {
  usersMap: new Map(),
  usersMapFetched: false,
  userGroupsMap: new Map(),
  userGroupsMapFetched: false,
  channelsMap: new Map(),
  dmChannelsMap: new Map(),
  bothChannelsMapFetched: false,
  clipFoldersMap: new Map(),
  clipFoldersMapFetched: false,
  stampsMap: new Map(),
  stampsMapFetched: false
}
