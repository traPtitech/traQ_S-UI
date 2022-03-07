import store from '/@/vuex'
import {
  createInitialFetchPromise,
  ExtractBooleanValueKeys
} from '/@/vuex/utils/promise'

const createIFPromise = (
  key: ExtractBooleanValueKeys<typeof store.state.entities>
) => createInitialFetchPromise(() => store.state.entities[key])

export const usersMapInitialFetchPromise = createIFPromise('usersMapFetched')
export const userGroupsMapInitialFetchPromise = createIFPromise(
  'userGroupsMapFetched'
)
export const bothChannelsMapInitialFetchPromise = createIFPromise(
  'bothChannelsMapFetched'
)
export const clipFoldersMapInitialFetchPromise = createIFPromise(
  'clipFoldersMapFetched'
)
export const stampsMapInitialFetchPromise = createIFPromise('stampsMapFetched')
export const stampPalettesMapInitialFetchPromise = createIFPromise(
  'stampPalettesMapFetched'
)
