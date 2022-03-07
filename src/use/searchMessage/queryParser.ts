import { channelPathToId } from '/@/lib/channelTree'
import { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import store from '/@/vuex'

const storeForParser: StoreForParser = {
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
    const { primaryView } = store.state.ui.mainView
    return primaryView.type === 'channel' || primaryView.type === 'dm'
      ? primaryView.channelId
      : undefined
  }
}

const useQueryParer = () => {
  const parseQuery = createQueryParser(storeForParser)

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParer
