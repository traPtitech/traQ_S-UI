import { User } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { entityMitt } from './mitt'
import { CacheStrategy, fetchWithCacheStrategy } from './utils'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { ActiveUser, isActive } from '/@/lib/user'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { UserId } from '/@/types/entity-ids'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'

const getUser = createSingleflight(apis.getUser.bind(apis))
const getUserByName = createSingleflight(
  async (name: string): Promise<{ data: User | undefined }> => {
    const res = await apis.getUsers(undefined, name)
    return { data: res.data[0] }
  }
)
const getUsers = createSingleflight(apis.getUsers.bind(apis))

const useUsersStorePinia = defineStore('entities/users', () => {
  const usersMap = ref(new Map<UserId, User>())
  const usersMapFetched = ref(false)
  const usersMapInitialFetchPromise = ref(
    useTrueChangedPromise(usersMapFetched)
  )

  const activeUsersMap = computed(
    () =>
      new Map(
        [...usersMap.value.entries()].filter(
          (entry): entry is [UserId, ActiveUser] => isActive(entry[1])
        )
      )
  )

  const findUserByName = (name: string) => {
    const loweredName = name.toLowerCase()
    return [...usersMap.value.values()].find(
      user => user?.name.toLowerCase() === loweredName
    )
  }
  const setUser = (user: User) => {
    usersMap.value.set(user.id, user)
    entityMitt.emit('setUser')
  }
  const deleteUser = (userId: UserId) => {
    usersMap.value.delete(userId)
    entityMitt.emit('deleteUser')
  }

  const fetchUser = async ({
    userId,
    cacheStrategy = 'waitForAllFetch'
  }: {
    userId: UserId
    cacheStrategy?: CacheStrategy
  }) => {
    const user = await fetchWithCacheStrategy(
      cacheStrategy,
      usersMap,
      userId,
      usersMapFetched.value,
      usersMapInitialFetchPromise.value,
      getUser,
      setUser
    )
    return user
  }

  const fetchUserByName = async ({
    username,
    cacheStrategy = 'waitForAllFetch'
  }: {
    username: string
    cacheStrategy?: CacheStrategy
  }) => {
    // usernameが空のものは存在しないので弾く
    if (username === '') {
      return undefined
    }

    // キャッシュを利用する場合はこのブロックに入る
    if (cacheStrategy === 'useCache' || cacheStrategy === 'waitForAllFetch') {
      const res = findUserByName(username)
      if (res) {
        return res
      }

      // キャッシュに存在してなかったかつ、全取得が完了してない場合は
      // 全取得を待って含まれてるか確認する
      if (cacheStrategy === 'waitForAllFetch' && !usersMapFetched.value) {
        await usersMapInitialFetchPromise.value

        const res = findUserByName(username)
        if (res) {
          return res
        }
      }
    }

    const [{ data: res }, isShared] = await getUserByName(username)
    // 他の取得とまとめられていた場合は既にcommitされてるためcommitしない
    if (!isShared && res) {
      setUser(res)
    }
    return res
  }

  const fetchUsers = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && usersMapFetched.value) {
      return usersMap.value
    }

    const [{ data: users }, shared] = await getUsers()
    const newUsersMap = arrayToMap(users, 'id')
    if (!shared) {
      usersMap.value = newUsersMap
      usersMapFetched.value = true
      entityMitt.emit('setUsers')
    }
    return newUsersMap
  }

  wsListener.on('USER_JOINED', ({ id }) => {
    fetchUser({ userId: id })
  })
  wsListener.on('USER_UPDATED', ({ id }) => {
    fetchUser({ userId: id, cacheStrategy: 'forceFetch' })
  })
  wsListener.on('USER_LEFT', ({ id }) => {
    deleteUser(id)
  })
  wsListener.on('USER_ICON_UPDATED', ({ id }) => {
    fetchUser({ userId: id, cacheStrategy: 'forceFetch' })
  })
  wsListener.on('reconnect', () => {
    fetchUsers({ ignoreCache: true })
  })

  return {
    usersMap,
    usersMapInitialFetchPromise,
    activeUsersMap,
    findUserByName,
    fetchUser,
    fetchUserByName,
    fetchUsers
  }
})

export const useUsersStore = convertToRefsStore(useUsersStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStorePinia, import.meta.hot))
}
