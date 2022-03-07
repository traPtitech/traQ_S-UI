import {
  ChannelId,
  ClipFolderId,
  StampId,
  StampPaletteId,
  UserGroupId,
  UserId
} from '/@/types/entity-ids'
import {
  Channel,
  ClipFolder,
  DMChannel,
  Stamp,
  StampPalette,
  User,
  UserGroup
} from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setUser(state, user: User) {
    state.usersMap.set(user.id, user)
  },
  setUsersMap(state, usersMap: Map<UserId, User>) {
    state.usersMap = usersMap
    state.usersMapFetched = true
  },
  deleteUser(state, userId: UserId) {
    state.usersMap.delete(userId)
  },

  setUserGroup(state, userGroup: UserGroup) {
    state.userGroupsMap.set(userGroup.id, userGroup)
  },
  setUserGroupsMap(state, userGroupsMap: Map<UserGroupId, UserGroup>) {
    state.userGroupsMap = userGroupsMap
    state.userGroupsMapFetched = true
  },
  deleteUserGroup(state, userGroupId: UserGroupId) {
    state.userGroupsMap.delete(userGroupId)
  },

  setChannel(state, channel: Channel) {
    state.channelsMap.set(channel.id, channel)
  },
  setDmChannel(state, dmChannel: DMChannel) {
    state.dmChannelsMap.set(dmChannel.id, dmChannel)
  },
  setBothChannelsMap(
    state,
    [channelsMap, dmChannelsMap]: [
      Map<ChannelId, Channel>,
      Map<ChannelId, DMChannel>
    ]
  ) {
    state.channelsMap = channelsMap
    state.dmChannelsMap = dmChannelsMap
    state.bothChannelsMapFetched = true
  },
  deleteChannel(state, channelId: ChannelId) {
    state.channelsMap.delete(channelId)
    if (state.dmChannelsMap.has(channelId)) {
      state.dmChannelsMap.delete(channelId)
    }
  },

  setClipFolder(state, clipFolder: ClipFolder) {
    state.clipFoldersMap.set(clipFolder.id, clipFolder)
  },
  setClipFoldersMap(state, clipFoldersMap: Map<ClipFolderId, ClipFolder>) {
    state.clipFoldersMap = clipFoldersMap
    state.clipFoldersMapFetched = true
  },
  deleteClipFolder(state, clipFolderId: ClipFolderId) {
    state.clipFoldersMap.delete(clipFolderId)
  },

  setStamp(state, stamp: Stamp) {
    state.stampsMap.set(stamp.id, stamp)
  },
  setStampsMap(state, stampsMap: Map<StampId, Stamp>) {
    state.stampsMap = stampsMap
    state.stampsMapFetched = true
  },
  deleteStamp(state, stampId: StampId) {
    state.stampsMap.delete(stampId)
  },

  setStampPalette(state, stampPalette: StampPalette) {
    state.stampPalettesMap.set(stampPalette.id, stampPalette)
  },
  setStampPalettesMap(
    state,
    stampPalettesMap: Map<StampPaletteId, StampPalette>
  ) {
    state.stampPalettesMap = stampPalettesMap
    state.stampPalettesMapFetched = true
  },
  deleteStampPalette(state, stampPaletteId: StampPaletteId) {
    state.stampPalettesMap.delete(stampPaletteId)
  }
})
