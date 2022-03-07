import store from '/@/vuex'
import {
  createInitialFetchPromise,
  ExtractBooleanValueKeys
} from '/@/vuex/utils/promise'

const createIFPromise = (
  key: ExtractBooleanValueKeys<typeof store.state.domain.me>
) => createInitialFetchPromise(() => store.state.domain.me[key])

export const unreadChannelsMapInitialFetchPromise = createIFPromise(
  'unreadChannelsMapFetched'
)
export const viewStatesInitialFetchPromise =
  createIFPromise('viewStatesFetched')
