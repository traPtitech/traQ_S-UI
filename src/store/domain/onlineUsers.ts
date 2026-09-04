import { readonly, ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { UserId } from '/@/types/entity-ids'

const useOnlineUsersPinia = defineStore('domain/onlineUsers', () => {
  const onlineUsers = ref(new Set<UserId>())
  const onlineUsersFetched = ref(false)
  let changesDuringFetch: Map<UserId, boolean> | undefined
  let currentFetch: Promise<Set<UserId>> | undefined

  const fetchOnlineUsersFromApi = async () => {
    const changes = new Map<UserId, boolean>()
    changesDuringFetch = changes
    try {
      const { data: userIdsArray } = await apis.getOnlineUsers()
      const userIds = new Set(userIdsArray)
      changes.forEach((online, id) => {
        if (online) userIds.add(id)
        else userIds.delete(id)
      })
      onlineUsers.value = userIds
      onlineUsersFetched.value = true
      return userIds
    } finally {
      changesDuringFetch = undefined
    }
  }

  const fetchOnlineUsers = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (onlineUsersFetched.value && !ignoreCache) {
      return onlineUsers.value
    }

    if (currentFetch) return currentFetch

    currentFetch = fetchOnlineUsersFromApi()
    try {
      return await currentFetch
    } finally {
      currentFetch = undefined
    }
  }

  wsListener.on('USER_ONLINE', ({ id }) => {
    onlineUsers.value.add(id)
    changesDuringFetch?.set(id, true)
  })
  wsListener.on('USER_OFFLINE', ({ id }) => {
    onlineUsers.value.delete(id)
    changesDuringFetch?.set(id, false)
  })

  wsListener.on('reconnect', async () => {
    const pendingFetch = currentFetch
    if (pendingFetch) await pendingFetch.catch(() => undefined)
    await fetchOnlineUsers({ ignoreCache: true })
  })

  return {
    onlineUsers: readonly(onlineUsers),
    fetchOnlineUsers
  }
})

export const useOnlineUsers = convertToRefsStore(useOnlineUsersPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineUsersPinia, import.meta.hot))
}
