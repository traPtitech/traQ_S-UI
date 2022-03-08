import { Ref } from 'vue'
import { channelPathToId, ChannelTree } from '/@/lib/channelTree'
import { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import { useMainViewStore, ViewInformation } from '/@/store/ui/mainView'
import store from '/@/vuex'
import { useChannelTree } from '/@/store/domain/channelTree'

const getStoreForParser = (
  primaryView: Ref<ViewInformation>,
  channelTree: Ref<ChannelTree>
): StoreForParser => ({
  channelPathToId: path => {
    try {
      return channelPathToId(path.split('/'), channelTree.value)
    } catch {
      return undefined
    }
  },
  usernameToId: async username => {
    const user = await store.dispatch.entities.fetchUserByName({ username })
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
  const parseQuery = createQueryParser(
    getStoreForParser(primaryView, channelTree)
  )

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParer
