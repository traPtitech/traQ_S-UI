import type { Channel, User } from '@traptitech/traq'

import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

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
import type { ChannelId } from '/@/types/entity-ids'

const getStoreForParser = ({
  primaryView,
  channelsMap,
  channelTree,
  myUsername,
  fetchUserByName
}: {
  primaryView: Ref<PrimaryViewInformation>
  channelsMap: Ref<ReadonlyMap<ChannelId, Channel>>
  channelTree: Ref<ChannelTree>
  myUsername: ComputedRef<string | undefined>
  fetchUserByName: (param: { username: string }) => Promise<User | undefined>
}): StoreForParser => ({
  channelPathToId: path =>
    setFallbackForNullishOrOnError(undefined).exec(() =>
      channelPathToId(path.split('/'), channelTree.value)
    ),
  usernameToId: async username => {
    const user = await fetchUserByName({ username })
    return user?.id
  },
  getCurrentChannelPath: () => {
    const channelId =
      primaryView.value.type === 'channel' || primaryView.value.type === 'dm'
        ? primaryView.value.channelId
        : undefined
    return channelId
      ? channelIdToPathString(channelId, channelsMap.value)
      : undefined
  },
  getMyUsername: () => myUsername.value
})

const useQueryParser = () => {
  const { channelsMap } = useChannelsStore()
  const { channelTree } = useChannelTree()
  const { primaryView } = useMainViewStore()
  const { fetchUserByName } = useUsersStore()
  const { detail: me } = useMeStore()
  const parseQuery = createQueryParser(
    getStoreForParser({
      primaryView,
      channelsMap,
      channelTree,
      myUsername: computed(() => me.value?.name),
      fetchUserByName
    })
  )

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParser
