import { ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'

const useStarredChannelsPinia = defineStore('domain/starredChannels', () => {
  const starredChannelSet = ref(new Set<ChannelId>())
  const starredChannelSetFetched = ref(false)
  const fetchStarredChannels = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && starredChannelSetFetched.value) return

    const { data } = await apis.getMyStars()
    starredChannelSet.value = new Set(data)
    starredChannelSetFetched.value = true
  }

  wsListener.on('CHANNEL_STARED', ({ id }) => {
    starredChannelSet.value.add(id)
  })
  wsListener.on('CHANNEL_UNSTARED', ({ id }) => {
    starredChannelSet.value.delete(id)
  })
  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    starredChannelSet.value.delete(id)
  })
  wsListener.on('reconnect', () => {
    fetchStarredChannels({ ignoreCache: true })
  })

  return {
    starredChannelSet,
    fetchStarredChannels
  }
})

export const useStarredChannels = convertToRefsStore(useStarredChannelsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStarredChannelsPinia, import.meta.hot)
  )
}
