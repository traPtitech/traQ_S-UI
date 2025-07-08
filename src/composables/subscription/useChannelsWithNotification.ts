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

  const channelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const channelsWithUnreadMessage = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => !unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const noticeableChannels = computed(() => {
    const starred = channelsWithNotification.value.filter(channel =>
      starredChannelStore.staredChannelSet.value.has(channel.id)
    )
    const notStarred = channelsWithNotification.value.filter(
      channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
    )
    return [...starred, ...notStarred]
  })

  const unreadChannels = computed(() => {
    const starred = channelsWithUnreadMessage.value.filter(channel =>
      starredChannelStore.staredChannelSet.value.has(channel.id)
    )
    const notStarred = channelsWithUnreadMessage.value.filter(
      channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
    )
    return [...starred, ...notStarred]
  })

  const dmChannelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
  )

  return {
    noticeableChannels,
    unreadChannels,
    dmChannelsWithNotification
  }
}

export default useChannelsWithNotification
