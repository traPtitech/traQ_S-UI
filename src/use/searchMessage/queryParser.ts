import { Ref } from 'vue'
import { channelPathToId } from '/@/lib/channelTree'
import { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import { useMainViewStore, ViewInformation } from '/@/store/ui/mainView'
import store from '/@/vuex'

const getStoreForParser = (
  primaryView: Ref<ViewInformation>
): StoreForParser => ({
  channelPathToId: path => {
    try {
      return channelPathToId(
        path.split('/'),
        store.state.domain.channelTree.channelTree
      )
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
  const { primaryView } = useMainViewStore()
  const parseQuery = createQueryParser(getStoreForParser(primaryView))

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParer
