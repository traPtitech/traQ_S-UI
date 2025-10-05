import type { UserId } from '/@/types/entity-ids'
import type { MyUserDetail } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, toRefs } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { deleteToken } from '/@/lib/notification/notification'
import { wsListener } from '/@/lib/websocket'
import apis from '/@/lib/apis'
import { isAxiosError } from 'axios'
import { useRouter } from 'vue-router'

export type IDBState = {
  detail: Readonly<MyUserDetail> | undefined
}

const useMeStorePinia = defineStore('domain/me', () => {
  const initialValue: IDBState = {
    detail: undefined
  }
  const router = useRouter()

  // TODO: ログインチェック時にrestoreを待つ必要があるかもしれない
  const [state] = useIndexedDbValue('store/domain/me', 1, {}, initialValue)

  const myId = computed(() => state.detail?.id)

  const fetchMe = async (): Promise<MyUserDetail | undefined> => {
    const retryDelayMs = 1000 // 1 sec
    const retryMaxCount = 10

    for (let i = 0; i < retryMaxCount; i++) {
      try {
        const { data } = await apis.getMe()
        state.detail = data
        return data
      } catch (error) {
        state.detail = undefined

        if (!isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.error(new Error('Failed to fetchMe:', { cause: error }))
          return undefined
        }
        if (error.status === 401) {
          router.push('/login')
          return undefined
        }

        // FIXME: エラーハンドリングのためにとりあえず retry しています
        // eslint-disable-next-line no-console
        console.warn('Failed to fetchMe, retrying...', { cause: error })
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
      }
    }

    // eslint-disable-next-line no-console
    console.error(new Error(`Failed to fetchMe after ${retryMaxCount} retry`))
    return undefined
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
