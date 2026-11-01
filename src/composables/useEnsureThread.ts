import type { MaybeRefOrGetter } from 'vue'
import { toValue, watchEffect } from 'vue'

import { useChannelsStore } from '/@/store/entities/channels'
import { useThreadsStore } from '/@/store/entities/threads'
import type { ChannelId, ThreadChannelId } from '/@/types/entity-ids'

const useEnsureThread = (
  channelId: MaybeRefOrGetter<
    ChannelId | readonly ChannelId[] | null | undefined
  >
) => {
  const { channelsMap, dmChannelsMap, bothChannelsMapFetched } =
    useChannelsStore()
  const { threadsMap, fetchThread } = useThreadsStore()

  const fetch = async (threadId: ThreadChannelId) => {
    try {
      await fetchThread(threadId)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  watchEffect(() => {
    if (!bothChannelsMapFetched.value) return

    const value = toValue(channelId)
    const channelIds = Array.isArray(value) ? value : [value]
    for (const id of channelIds) {
      if (
        !id ||
        channelsMap.value.has(id) ||
        dmChannelsMap.value.has(id) ||
        threadsMap.value.has(id)
      ) {
        continue
      }
      fetch(id)
    }
  })
}

export default useEnsureThread
