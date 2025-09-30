import type { Ref } from 'vue'
import type { ChannelTree } from '/@/lib/channelTree'
import { channelPathToId as channelPathToIdImpl } from '/@/lib/channelTree'
import type { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import type { PrimaryViewInformation } from '/@/store/ui/mainView'
import { useMainViewStore } from '/@/store/ui/mainView'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useUsersStore } from '/@/store/entities/users'
import type { Channel, DMChannel, User, UserGroup } from '@traptitech/traq'
import { channelIdToPathString } from '/@/lib/channel'
import type {
  ChannelId,
  DMChannelId,
  UserGroupId,
  UserId
} from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'
import { useMeStore } from '/@/store/domain/me'
import { useGroupsStore } from '/@/store/entities/groups'

const getStoreForParser = ({
  primaryView,
  channelsMap,
  dmChannelsMap,
  userIdToDmChannelIdMap,
  channelTree,
  usersMap,
  userGroupsMap,
  me,
  fetchUserByName,
  getUserGroupByName,
  getUserGroupsByUserId
}: {
  primaryView: Ref<PrimaryViewInformation>
  channelsMap: Ref<ReadonlyMap<ChannelId, Channel>>
  dmChannelsMap: Ref<ReadonlyMap<DMChannelId, DMChannel>>
  userIdToDmChannelIdMap: Ref<ReadonlyMap<UserId, DMChannelId>>
  channelTree: Ref<ChannelTree>
  usersMap: Ref<ReadonlyMap<UserId, User>>
  userGroupsMap: Ref<ReadonlyMap<UserGroupId, UserGroup>>
  me: Ref<User | undefined>
  fetchUserByName: (param: { username: string }) => Promise<User | undefined>
  getUserGroupByName: (name: string) => UserGroup | undefined
  getUserGroupsByUserId: (userId: UserId) => UserGroup[]
}): StoreForParser => {
  const getMyUsername = () => me.value?.name
  const getMyUserId = () => me.value?.id

  const userIdToDmChannelId = (userId: UserId): DMChannelId | undefined => {
    return userIdToDmChannelIdMap.value.get(userId)
  }

  const channelIdToPath = (channelId: ChannelId): string | undefined => {
    return channelIdToPathString(channelId, channelsMap.value)
  }

  const usernameToId = async (
    username: string
  ): Promise<UserId | undefined> => {
    const user = await fetchUserByName({ username })
    return user?.id
  }

  const userIdToName = (userId: UserId): string | undefined => {
    return usersMap.value.get(userId)?.name
  }

  const getCurrentChannelId = () => {
    return primaryView.value.type === 'channel' ||
      primaryView.value.type === 'dm'
      ? primaryView.value.channelId
      : undefined
  }

  const usernameToDmChannelId = async (
    username: string
  ): Promise<DMChannelId | undefined> => {
    const id = await usernameToId(username)
    if (!id) return undefined
    return userIdToDmChannelId(id)
  }

  const userGroupNameToId = async (
    name: string
  ): Promise<UserGroupId | undefined> => {
    const group = await getUserGroupByName(name)
    return group?.id
  }

  const userGroupIdToUserIds = (
    userGroupId: UserGroupId
  ): UserId[] | undefined => {
    const group = userGroupsMap.value.get(userGroupId)
    if (!group) return undefined
    return group.members.map(({ id }) => id)
  }

  const userIdToUserGroupIds = (userId: UserId): UserGroupId[] | undefined => {
    return getUserGroupsByUserId(userId).map(g => g.id)
  }

  const getCurrentChannelPathOrUsername = () => {
    const channelId = getCurrentChannelId()
    if (!channelId) return undefined

    const path = channelIdToPath(channelId)
    if (path) return `#${path}`

    const userId = dmChannelsMap.value.get(channelId)?.userId
    if (!userId) return undefined

    const username = usersMap.value.get(userId)?.name
    if (username) return `@${username}`
  }

  const getMyDmChannelId = () => {
    const myUserId = getMyUserId()
    if (!myUserId) return undefined
    return userIdToDmChannelId(myUserId)
  }

  const channelPathToId = (path: string): ChannelId | undefined => {
    try {
      return channelPathToIdImpl(path.split('/'), channelTree.value)
    } catch {
      return undefined
    }
  }

  return {
    channelPathToId,
    usernameToDmChannelId,
    usernameToId,
    userIdToName,
    userGroupNameToId,
    userGroupIdToUserIds,
    userIdToUserGroupIds,
    getCurrentChannelPathOrUsername,
    getCurrentChannelId,
    getMyDmChannelId,
    getMyUsername,
    getMyUserId
  }
}

const useQueryParser = () => {
  const { channelsMap, dmChannelsMap, userIdToDmChannelIdMap } =
    useChannelsStore()
  const { channelTree } = useChannelTree()
  const { primaryView } = useMainViewStore()
  const { fetchUserByName, usersMap } = useUsersStore()
  const { getUserGroupByName, userGroupsMap, getUserGroupsByUserId } =
    useGroupsStore()
  const { detail: me } = useMeStore()

  const parseQuery = createQueryParser(
    getStoreForParser({
      primaryView,
      channelsMap,
      dmChannelsMap,
      userIdToDmChannelIdMap,
      channelTree,
      usersMap,
      userGroupsMap,
      me,
      fetchUserByName,
      getUserGroupByName,
      getUserGroupsByUserId
    })
  )

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParser
