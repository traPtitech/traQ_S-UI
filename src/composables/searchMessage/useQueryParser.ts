import type { Channel, DMChannel, User } from '@traptitech/traq'

import type { Ref } from 'vue'

import { setFallbackForNullishOrOnError } from '/@/lib/basic/fallback'
import { channelIdToPathString } from '/@/lib/channel'
import type { ChannelTree } from '/@/lib/channelTree'
import { channelPathToId } from '/@/lib/channelTree'
import type { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import type { PrimaryViewInformation } from '/@/store/ui/mainView'
import { useMainViewStore } from '/@/store/ui/mainView'
import type { ChannelId, DMChannelId, UserId } from '/@/types/entity-ids'

const getStoreForParser = ({
  primaryView,
  channelsMap,
  dmChannelsMap,
  userIdToDmChannelIdMap,
  channelTree,
  usersMap,
  me,
  fetchUserByName
}: {
  primaryView: Ref<PrimaryViewInformation>
  channelsMap: Ref<ReadonlyMap<ChannelId, Channel>>
  dmChannelsMap: Ref<ReadonlyMap<DMChannelId, DMChannel>>
  userIdToDmChannelIdMap: Ref<ReadonlyMap<UserId, DMChannelId>>
  channelTree: Ref<ChannelTree>
  usersMap: Ref<ReadonlyMap<UserId, User>>
  me: Ref<User | undefined>
  fetchUserByName: (param: { username: string }) => Promise<User | undefined>
}): StoreForParser => ({
  channelPathToId: path =>
    setFallbackForNullishOrOnError(undefined).exec(() =>
      channelPathToId(path.split('/'), channelTree.value)
    ),
  usernameToDmChannelId: async username => {
    const user = await fetchUserByName({ username })
    return userIdToDmChannelIdMap.value.get(user?.id ?? '')
  },
  usernameToId: async username => {
    const user = await fetchUserByName({ username })
    return user?.id
  },
  getCurrentChannelPathOrUsername: () => {
    const channelId =
      primaryView.value.type === 'channel' || primaryView.value.type === 'dm'
        ? primaryView.value.channelId
        : undefined
    if (!channelId) return undefined

    const path = channelIdToPathString(channelId, channelsMap.value)
    if (path) return `#${path}`

    const userId = dmChannelsMap.value.get(channelId)?.userId
    if (!userId) return undefined

    const username = usersMap.value.get(userId)?.name
    if (username) return `@${username}`
  },
  getCurrentChannelId: () => {
    return primaryView.value.type === 'channel' ||
      primaryView.value.type === 'dm'
      ? primaryView.value.channelId
      : undefined
  },
  getMyDmChannelId: () => {
    const myUserId = me.value?.id
    if (!myUserId) return undefined
    return userIdToDmChannelIdMap.value.get(myUserId)
  },
  getMyUsername: () => `@${me.value?.name}`,
  getMyUserId: () => me.value?.id
})

const useQueryParser = () => {
  const { channelsMap, dmChannelsMap, userIdToDmChannelIdMap } =
    useChannelsStore()
  const { channelTree } = useChannelTree()
  const { primaryView } = useMainViewStore()
  const { fetchUserByName, usersMap } = useUsersStore()
  const { detail: me } = useMeStore()
  const parseQuery = createQueryParser(
    getStoreForParser({
      primaryView,
      channelsMap,
      dmChannelsMap,
      userIdToDmChannelIdMap,
      channelTree,
      usersMap,
      me,
      fetchUserByName
    })
  )

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParser
