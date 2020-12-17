import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from '.'
import { ActionContext } from 'vuex'
import { UserId } from '@/types/entity-ids'
import apis from '@/lib/apis'
import { createSingleflight } from '@/lib/async'
import { User } from '@traptitech/traq'
import { usersMapInitialFetchPromise } from './promises'
import { AxiosResponse } from 'axios'

export const entitiesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, entities)

/**
 * キャッシュを使うかどうかと全取得が完了するまで待つか
 * forceFetch: キャッシュを一切利用しない
 * useCache: あればキャッシュを利用して、全取得が終わってない場合でもそれを待たずに取得する
 * waitForAllFetch: 全取得が完了してから取得が必要なときだけ取得する
 */
type CacheStrategy = 'forceFetch' | 'useCache' | 'waitForAllFetch'

const getUser = createSingleflight(apis.getUser.bind(apis))
const getUsers = createSingleflight(apis.getUsers.bind(apis))

/**
 * キャッシュを使いつつ単体を取得する
 * @param cacheStrategy CacheStrategy型を参照
 * @param map usersMapのように一覧が格納されているMap
 * @param key MapのKey、usersMapならuserId
 * @param fetched 全件取得が完了したか、例えばusersMapFetched
 * @param fetch singleflight化した取得関数
 * @param set 取得が発生したときに行うcommit
 * @returns 取得結果
 *
 * @see [traQ_S-UI#1699](https://github.com/traPtitech/traQ_S-UI/pull/1699#issuecomment-747115101)
 */
const fetchWithCacheStrategy = async <T, R>(
  cacheStrategy: CacheStrategy,
  map: Map<T, R>,
  key: T,
  fetched: boolean,
  initialFetchPromise: Promise<void>,
  fetch: (key: T) => Promise<[AxiosResponse<R>, boolean]>,
  set: (res: R) => void
): Promise<R> => {
  // キャッシュを利用する場合はこのブロックに入る
  if (cacheStrategy === 'useCache' || cacheStrategy === 'waitForAllFetch') {
    const res = map.get(key)
    if (res) {
      return res
    }

    // キャッシュに存在してなかったかつ、全取得が完了してない場合は
    // 全取得を待って含まれてるか確認する
    if (cacheStrategy === 'waitForAllFetch' && !fetched) {
      await initialFetchPromise
      const res = map.get(key)
      if (res) {
        return res
      }
    }
  }

  const [{ data: res }, isShared] = await fetch(key)
  // 他の取得とまとめられていた場合は既にcommitされてるためcommitしない
  if (!isShared) {
    set(res)
  }
  return res
}

export const actions = defineActions({
  async fetchUser(
    context,
    {
      userId,
      cacheStrategy = 'waitForAllFetch'
    }: { userId: UserId; cacheStrategy?: CacheStrategy }
  ): Promise<User | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const user = await fetchWithCacheStrategy(
      cacheStrategy,
      state.usersMap,
      userId,
      state.usersMapFetched,
      usersMapInitialFetchPromise,
      getUser,
      user => {
        commit.setUser(user)
      }
    )
    return user
  },
  async fetchUsers(
    context,
    { force = false }: { force?: boolean } = {}
  ): Promise<Map<UserId, User>> {
    const { state, commit } = entitiesActionContext(context)
    if (!force && state.usersMapFetched) {
      return state.usersMap
    }

    const [{ data: users }, shared] = await getUsers()
    const usersMap = new Map(users.map(user => [user.id, user]))
    if (!shared) {
      commit.setUsersMap(usersMap)
    }
    return usersMap
  },
  deleteUser(context, userId: UserId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteUser(userId)
  }
})
