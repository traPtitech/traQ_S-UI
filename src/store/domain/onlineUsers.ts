import { readonly, ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { UserId } from '/@/types/entity-ids'

const useOnlineUsersPinia = defineStore('domain/onlineUsers', () => {
  const onlineUsers = ref(new Set<UserId>())
  const lastOnlineAt = ref(new Map<UserId, string>())
  const onlineUsersFetched = ref(false)
  let changesDuringFetch:
    Map<UserId, { online: boolean; confirmedAt: string }> | undefined
  let currentFetch: Promise<Set<UserId>> | undefined

  const fetchOnlineUsersFromApi = async () => {
    const changes = new Map<UserId, { online: boolean; confirmedAt: string }>()
    changesDuringFetch = changes
    try {
      const { data: userIdsArray } = await apis.getOnlineUsers()
      const userIds = new Set(userIdsArray)
      const confirmedAt = new Date().toISOString()
      const confirmedAtByUser = new Map(lastOnlineAt.value)
      userIds.forEach(id => confirmedAtByUser.set(id, confirmedAt))
      changes.forEach(({ online, confirmedAt }, id) => {
        if (online) userIds.add(id)
        else userIds.delete(id)
        confirmedAtByUser.set(id, confirmedAt)
      })
      onlineUsers.value = userIds
      lastOnlineAt.value = confirmedAtByUser
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
    const confirmedAt = new Date().toISOString()
    onlineUsers.value.add(id)
    lastOnlineAt.value.set(id, confirmedAt)
    changesDuringFetch?.set(id, { online: true, confirmedAt })
  })
  wsListener.on('USER_OFFLINE', ({ id }) => {
    const confirmedAt = new Date().toISOString()
    onlineUsers.value.delete(id)
    lastOnlineAt.value.set(id, confirmedAt)
    changesDuringFetch?.set(id, { online: false, confirmedAt })
  })
  wsListener.on('PING', () => {
    if (changesDuringFetch) return

    const confirmedAt = new Date().toISOString()
    onlineUsers.value.forEach(id => lastOnlineAt.value.set(id, confirmedAt))
  })

  wsListener.on('reconnect', async () => {
    const pendingFetch = currentFetch
    if (pendingFetch) await pendingFetch.catch(() => undefined)
    await fetchOnlineUsers({ ignoreCache: true })
  })

  return {
    onlineUsers: readonly(onlineUsers),
    lastOnlineAt: readonly(lastOnlineAt),
    fetchOnlineUsers
  }
})

export const useOnlineUsers = convertToRefsStore(useOnlineUsersPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineUsersPinia, import.meta.hot))
}
