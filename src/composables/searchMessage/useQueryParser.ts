import type { Ref } from 'vue'
import type { ChannelTree } from '/@/lib/channelTree'
import { channelPathToId } from '/@/lib/channelTree'
import type { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import type { ViewInformation } from '/@/store/ui/mainView'
import { useMainViewStore } from '/@/store/ui/mainView'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useUsersStore } from '/@/store/entities/users'
import type { User } from '@traptitech/traq'

const getStoreForParser = ({
  primaryView,
  channelTree,
  fetchUserByName
}: {
  primaryView: Ref<ViewInformation>
  channelTree: Ref<ChannelTree>
  fetchUserByName: (param: { username: string }) => Promise<User | undefined>
}): StoreForParser => ({
  channelPathToId: path => {
    try {
      return channelPathToId(path.split('/'), channelTree.value)
    } catch {
      return undefined
    }
  },
  usernameToId: async username => {
    const user = await fetchUserByName({ username })
    return user?.id
  },
  getCurrentChannelId: () => {
    return primaryView.value.type === 'channel' ||
      primaryView.value.type === 'dm'
      ? primaryView.value.channelId
      : undefined
  }
})

const useQueryParer = () => {
  const { channelTree } = useChannelTree()
  const { primaryView } = useMainViewStore()
  const { fetchUserByName } = useUsersStore()
  const parseQuery = createQueryParser(
    getStoreForParser({ primaryView, channelTree, fetchUserByName })
  )

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParer
