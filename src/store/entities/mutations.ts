import { ChannelId, UserGroupId, UserId } from '@/types/entity-ids'
import { Channel, DMChannel, User, UserGroup } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import _store from '@/_store'

export const mutations = defineMutations<S>()({
  setUser(state: S, user: User) {
    state.usersMap.set(user.id, user)
  },
  setUsersMap(state: S, usersMap: Map<UserId, User>) {
    state.usersMap = usersMap
    state.usersMapFetched = true
  },
  deleteUser(state: S, userId: UserId) {
    state.usersMap.delete(userId)
  },

  setUserGroup(state: S, userGroup: UserGroup) {
    state.userGroupsMap.set(userGroup.id, userGroup)
  },
  setUserGroupsMap(state: S, userGroupsMap: Map<UserGroupId, UserGroup>) {
    state.userGroupsMap = userGroupsMap
    state.userGroupsMapFetched = true
  },
  deleteUserGroup(state: S, userGroupId: UserGroupId) {
    state.userGroupsMap.delete(userGroupId)
  },

  setChannel(state: S, channel: Channel) {
    state.channelsMap.set(channel.id, channel)
  },
  setDmChannel(state: S, dmChannel: DMChannel) {
    state.dmChannelsMap.set(dmChannel.id, dmChannel)
  },
  setBothChannelsMap(
    state: S,
    [channelsMap, dmChannelsMap]: [
      Map<ChannelId, Channel>,
      Map<ChannelId, DMChannel>
    ]
  ) {
    state.channelsMap = channelsMap
    state.dmChannelsMap = dmChannelsMap
    state.bothChannelsMapFetched = true

    // TODO: eventを使うようにする
    _store.dispatch.domain.channelTree.constructAllTrees()
  },
  deleteChannel(state: S, channelId: ChannelId) {
    state.channelsMap.delete(channelId)
  }
})
