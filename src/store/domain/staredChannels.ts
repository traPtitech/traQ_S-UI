import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '../entities/channels'

const useStaredChannelsPinia = defineStore('domain/staredChannels', () => {
  const staredChannelSet = ref(new Set<ChannelId>())
  const staredChannelSetFetched = ref(false)
  const { channelsMap } = useChannelsStore()

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

  const isChannelOrAncestorStarred = (channelId: ChannelId): boolean => {
    if (staredChannelSet.value.has(channelId)) {
      return true
    }

    const channel = channelsMap.value.get(channelId)
    if (!channel?.parentId) {
      return false
    }

    return isChannelOrAncestorStarred(channel.parentId)
  }

  return {
    staredChannelSet,
    fetchStaredChannels,
    isChannelOrAncestorStarred
  }
})

export const useStaredChannels = convertToRefsStore(useStaredChannelsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStaredChannelsPinia, import.meta.hot)
  )
}
