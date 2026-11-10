import { readonly, ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { UserId } from '/@/types/entity-ids'

const useOnlineUsersPinia = defineStore('domain/onlineUsers', () => {
  const onlineUsers = ref(new Set<UserId>())
  // Last offline timestamps supplied by the server, never the browser clock.
  const lastOnlineAt = ref(new Map<UserId, string>())
  const onlineUsersFetched = ref(false)
  let pendingFetch:
    { changes: Map<UserId, boolean>; promise: Promise<void> } | undefined

  const fetchOnlineUsersFromApi = async (changes: Map<UserId, boolean>) => {
    const { data } = await apis.getOnlineUsers()
    if (pendingFetch?.changes !== changes) return

    const userIds = new Set(data)
    changes.forEach((online, id) => {
      if (online) userIds.add(id)
      else userIds.delete(id)
    })

    onlineUsers.value = userIds
    onlineUsersFetched.value = true
  }

  const fetchOnlineUsers = async () => {
    if (onlineUsersFetched.value) return
    if (pendingFetch) return pendingFetch.promise

    const changes = new Map<UserId, boolean>()
    const promise = fetchOnlineUsersFromApi(changes)
    pendingFetch = { changes, promise }

    try {
      await promise
    } finally {
      if (pendingFetch?.changes === changes) pendingFetch = undefined
    }
  }

  const setUserOnline = (id: UserId, online: boolean) => {
    if (online) onlineUsers.value.add(id)
    else onlineUsers.value.delete(id)
    pendingFetch?.changes.set(id, online)
  }

  wsListener.on('USER_ONLINE', ({ id }) => setUserOnline(id, true))

  wsListener.on('USER_OFFLINE', ({ id, last_online }) => {
    setUserOnline(id, false)
    if (last_online) lastOnlineAt.value.set(id, last_online)
  })

  wsListener.on('reconnect', () => {
    pendingFetch = undefined
    onlineUsersFetched.value = false
    fetchOnlineUsers().catch(() => undefined)
  })

  return {
    onlineUsers: readonly(onlineUsers),
    onlineUsersFetched: readonly(onlineUsersFetched),
    lastOnlineAt: readonly(lastOnlineAt),
    fetchOnlineUsers
  }
})

export const useOnlineUsers = convertToRefsStore(useOnlineUsersPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineUsersPinia, import.meta.hot))
}
