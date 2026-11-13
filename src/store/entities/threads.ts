import type { Channel } from '@traptitech/traq'

import { ref } from 'vue'

import { isAxiosError } from 'axios'
import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { isUUID } from '/@/lib/basic/uuid'
import { wsListener } from '/@/lib/websocket'
import { useMainViewStore } from '/@/store/ui/mainView'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ThreadChannelId } from '/@/types/entity-ids'

export type ThreadChannel = Channel & {
  parentId: string
  parentMessageId: string
}

// SDKにスレッドの型が追加されるまでは応答のフィールドで判定する
export const isThreadChannel = (channel: Channel): channel is ThreadChannel =>
  'parentMessageId' in channel &&
  typeof channel.parentMessageId === 'string' &&
  !!channel.parentMessageId &&
  !!channel.parentId

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
      if (!isThreadChannel(channel)) {
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

  const fetchThreads = async () => {
    const threadIds = [...threadsMap.value.keys()]
    await Promise.allSettled(
      threadIds.map(threadId => fetchThread(threadId, { force: true }))
    )
  }

  const addThread = async (threadId: ThreadChannelId) => {
    const { data: channel } = await apis.getChannel(threadId)
    if (!isThreadChannel(channel)) return

    const { primaryView } = useMainViewStore()
    const view = primaryView.value

    if (view.type !== 'channel' || view.channelId !== channel.parentId) {
      return
    }

    setThread(channel)
  }

  const updateThread = async (threadId: ThreadChannelId) => {
    if (threadsMap.value.has(threadId)) {
      await fetchThread(threadId, { force: true })
      return
    }
    await addThread(threadId)
  }

  wsListener.on('THREAD_CREATED', ({ id }) => {
    addThread(id)
  })
  wsListener.on('THREAD_UPDATED', ({ id }) => {
    updateThread(id)
  })
  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    deleteThread(id)
  })
  wsListener.on('reconnect', () => {
    fetchThreads()
  })

  return { threadsMap, setThread, fetchThread, fetchThreads }
})

export const useThreadsStore = convertToRefsStore(useThreadsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThreadsStorePinia, import.meta.hot))
}
