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
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  )

  const channelsWithNoticeable = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const channelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => !unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const starredChannelsWithNoticeable = computed(() =>
    channelsWithNoticeable.value.filter(channel =>
      starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const notStarredChannelsWithNoticeable = computed(() =>
    channelsWithNoticeable.value.filter(
      channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const starredChannelsWithNotification = computed(() =>
    channelsWithNotification.value.filter(channel =>
      starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const notStarredChannelsWithNotification = computed(() =>
    channelsWithNotification.value.filter(
      channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
    )
  )

  const dmChannelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
  )

  return {
    starredChannelsWithNoticeable,
    notStarredChannelsWithNoticeable,
    starredChannelsWithNotification,
    notStarredChannelsWithNotification,
    dmChannelsWithNotification
  }
}

export default useChannelsWithNotification
