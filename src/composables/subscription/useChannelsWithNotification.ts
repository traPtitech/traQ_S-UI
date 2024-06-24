import { computed } from 'vue'
import { isDefined } from '/@/lib/basic/array'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStaredChannels } from '/@/store/domain/staredChannels'

const useChannelsWithNotification = () => {
  const { unreadChannelsMap } = useSubscriptionStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const { staredChannelSet } = useStaredChannels()

  const sortedUnreadChannels = computed(() =>
    [...unreadChannelsMap.value.values()].sort((a, b) => {
      if (a.noticeable !== b.noticeable) {
        return b.noticeable ? 1 : -1
      }
      if (
        staredChannelSet.value.has(a.channelId) !==
        staredChannelSet.value.has(b.channelId)
      ) {
        return staredChannelSet.value.has(a.channelId) ? -1 : 1
      }
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  )

  const channelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const dmChannelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
  )

  return {
    channelsWithNotification,
    dmChannelsWithNotification
  }
}

export default useChannelsWithNotification
