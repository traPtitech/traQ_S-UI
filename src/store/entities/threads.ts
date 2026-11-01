import type { Channel } from '@traptitech/traq'

import { ref } from 'vue'

import { isAxiosError } from 'axios'
import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { isUUID } from '/@/lib/basic/uuid'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ThreadChannelId } from '/@/types/entity-ids'

export type ThreadChannel = Channel & {
  parentId: string
  parentMessageId: string
}

const getChannel = createSingleflight((id: ThreadChannelId) =>
  apis.getChannel(id)
)

const useThreadsStorePinia = defineStore('entities/threads', () => {
  const threadsMap = ref(new Map<ThreadChannelId, ThreadChannel>())

  const setThread = (thread: ThreadChannel) => {
    threadsMap.value.set(thread.id, thread)
  }
  const deleteThread = (threadId: ThreadChannelId) => {
    threadsMap.value.delete(threadId)
  }

  const fetchThread = async (
    threadId: ThreadChannelId,
    { force = false }: { force?: boolean } = {}
  ) => {
    if (!isUUID(threadId)) return undefined
    if (!force && threadsMap.value.has(threadId)) {
      return threadsMap.value.get(threadId)
    }

    try {
      const [{ data: channel }, shared] = await getChannel(threadId)
      // SDKにスレッドの型が追加されるまでは応答のフィールドで判定する
      if (
        !('parentMessageId' in channel) ||
        typeof channel.parentMessageId !== 'string' ||
        !channel.parentMessageId ||
        !channel.parentId
      ) {
        deleteThread(threadId)
        return undefined
      }

      const thread: ThreadChannel = {
        ...channel,
        parentId: channel.parentId,
        parentMessageId: channel.parentMessageId
      }
      if (!shared) {
        setThread(thread)
      }
      return thread
    } catch (error) {
      if (
        isAxiosError(error) &&
        [403, 404].includes(error.response?.status ?? 0)
      ) {
        deleteThread(threadId)
        return undefined
      }
      throw error
    }
  }

  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    deleteThread(id)
  })

  return { threadsMap, fetchThread }
})

export const useThreadsStore = convertToRefsStore(useThreadsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThreadsStorePinia, import.meta.hot))
}
