import type { UserId } from '/@/types/entity-ids'
import type { MyUserDetail } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, toRefs } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { deleteToken } from '/@/lib/notification/notification'
import { wsListener } from '/@/lib/websocket'
import apis from '/@/lib/apis'

export type IDBState = {
  detail: Readonly<MyUserDetail> | undefined
}

const useMeStorePinia = defineStore('domain/me', () => {
  const initialValue: IDBState = {
    detail: undefined
  }

  // TODO: ログインチェック時にrestoreを待つ必要があるかもしれない
  const [state] = useIndexedDbValue('store/domain/me', 1, {}, initialValue)

  const myId = computed(() => state.detail?.id)

  const fetchMe = async () => {
    try {
      const { data } = await apis.getMe()
      state.detail = data
      return data
    } catch {
      state.detail = undefined
      return undefined
    }
  }
  const logout = async ({
    allSession = false
  }: { allSession?: boolean } = {}) => {
    state.detail = undefined
    await apis.logout(undefined, allSession)
    deleteToken()
  }

  const onUserUpdated = (userId: UserId) => {
    if (myId.value !== userId) return
    fetchMe()
  }
  wsListener.on('USER_UPDATED', ({ id }) => {
    onUserUpdated(id)
  })
  wsListener.on('USER_ICON_UPDATED', ({ id }) => {
    onUserUpdated(id)
  })
  wsListener.on('reconnect', () => {
    fetchMe()
  })

  return {
    ...toRefs(state),
    myId,
    fetchMe,
    logout
  }
})

export const useMeStore = convertToRefsStore(useMeStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMeStorePinia, import.meta.hot))
}
