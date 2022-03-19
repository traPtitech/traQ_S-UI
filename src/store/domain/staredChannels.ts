import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { ChannelId } from '/@/types/entity-ids'

const useStaredChannelsPinia = defineStore('domain/staredChannels', () => {
  const staredChannelSet = ref(new Set<ChannelId>())
  const staredChannelSetFetched = ref(false)
  const fetchStaredChannels = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && staredChannelSetFetched.value) return

    const { data } = await apis.getMyStars()
    staredChannelSet.value = new Set(data)
    staredChannelSetFetched.value = true
  }

  wsListener.on('CHANNEL_STARED', ({ id }) => {
    staredChannelSet.value.add(id)
  })
  wsListener.on('CHANNEL_UNSTARED', ({ id }) => {
    staredChannelSet.value.delete(id)
  })
  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    staredChannelSet.value.delete(id)
  })
  wsListener.on('reconnect', () => {
    fetchStaredChannels({ ignoreCache: true })
  })

  return {
    staredChannelSet,
    fetchStaredChannels
  }
})

export const useStaredChannels = convertToRefsStore(useStaredChannelsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStaredChannelsPinia, import.meta.hot)
  )
}
