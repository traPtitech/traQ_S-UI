import { defineStore, acceptHMRUpdate } from 'pinia'
import { readonly, ref } from 'vue'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { UserId } from '/@/types/entity-ids'

const getOnlineUsers = createSingleflight(apis.getOnlineUsers.bind(apis))

const useOnlineUsersPinia = defineStore('domain/onlineUsers', () => {
  const onlineUsers = ref(new Set<UserId>())
  const onlineUsersFetched = ref(false)

  const fetchOnlineUsers = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (onlineUsersFetched.value && !ignoreCache) {
      return onlineUsers.value
    }

    const [{ data: userIdsArray }, shared] = await getOnlineUsers()
    const userIds = new Set(userIdsArray)
    if (!shared) {
      onlineUsers.value = new Set(userIds)
      onlineUsersFetched.value = true
    }
    return userIds
  }

  wsListener.on('USER_ONLINE', ({ id }) => {
    onlineUsers.value.add(id)
  })
  wsListener.on('USER_OFFLINE', ({ id }) => {
    onlineUsers.value.delete(id)
  })

  wsListener.on('reconnect', () => {
    fetchOnlineUsers({ ignoreCache: true })
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
