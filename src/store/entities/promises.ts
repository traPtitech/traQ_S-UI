import { watch } from 'vue'
import store from '..'
import { S } from './state'
import { waitMount } from '@/onMount'

type ExtractBooleanValueKeys<T> = keyof {
  [K in keyof T as T[K] extends boolean ? K : never]: T[K]
}

/**
 * 最初に`～Fetched`が`true`になったときにresolveするPromiseを返す
 * @param fetchedPropertyName entitiesのstateのうち値がbooleanであるようなキーだけを許可
 *   想定は`～Fetched`
 */
const createInitialFetchPromise = async <N extends ExtractBooleanValueKeys<S>>(
  fetchedPropertyName: N
) => {
  await waitMount
  return new Promise<void>(async resolve => {
    const stop = watch(
      () => store.state.entities[fetchedPropertyName],
      fetched => {
        if (fetched) {
          resolve()
          stop()
        }
      }
    )
  })
}

export const usersMapInitialFetchPromise = createInitialFetchPromise(
  'usersMapFetched'
)
export const userGroupsMapInitialFetchPromise = createInitialFetchPromise(
  'userGroupsMapFetched'
)
export const bothChannelsMapInitialFetchPromise = createInitialFetchPromise(
  'bothChannelsMapFetched'
)
export const clipFoldersMapInitialFetchPromise = createInitialFetchPromise(
  'clipFoldersMapFetched'
)
export const stampsMapInitialFetchPromise = createInitialFetchPromise(
  'stampsMapFetched'
)
export const stampPalettesMapInitialFetchPromise = createInitialFetchPromise(
  'stampPalettesMapFetched'
)
