import { computed } from 'vue'
import { isDefined } from '/@/lib/basic/array'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStaredChannels } from '/@/store/domain/staredChannels'

const useChannelsWithNotification = () => {
  const { unreadChannelsMap } = useSubscriptionStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const starredChannelStore = useStaredChannels()

  const sortedUnreadChannels = computed(() =>
    [...unreadChannelsMap.value.values()].sort((a, b) => {
      if (a.noticeable !== b.noticeable) {
        return b.noticeable ? 1 : -1
      }
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  )

  const channelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const notStarredChannelsWithNotification = computed(() =>
    channelsWithNotification.value.filter(
      channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const starredChannelsWithNotification = computed(() =>
    channelsWithNotification.value.filter(channel =>
      starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const dmChannelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
  )

  return {
    starredChannelsWithNotification,
    notStarredChannelsWithNotification,
    dmChannelsWithNotification
  }
}

export default useChannelsWithNotification
