import { computed } from 'vue'
import { isDefined } from '/@/lib/basic/array'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

const useChannelsWithNotification = () => {
  const { unreadChannelsMap, subscriptionMap } = useSubscriptionStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const starredChannelStore = useStaredChannels()

  const mode = computed<'starred' | 'notified' | 'default' | 'both'>(() => {
    const { featureFlags } = useFeatureFlagSettings()
    if (featureFlags.value.flag_show_star_in_unread_channel_list.enabled) {
      return featureFlags.value.flag_show_notified_in_unread_channel_list
        .enabled
        ? 'both'
        : 'starred'
    }
    if (featureFlags.value.flag_show_notified_in_unread_channel_list.enabled) {
      return 'notified'
    }
    return 'default'
  })

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
    if (mode.value === 'starred' || mode.value === 'both') {
      const starred = channelsWithNotification.value.filter(channel =>
        starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      const notStarred = channelsWithNotification.value.filter(
        channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...starred, ...notStarred]
    }

    return channelsWithNotification.value
  })

  const unreadChannels = computed(() => {
    if (mode.value === 'both') {
      const noticeable = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) ===
          ChannelSubscribeLevel.notified
      )
      const starred = channelsWithUnreadMessage.value.filter(
        channel =>
          starredChannelStore.staredChannelSet.value.has(channel.id) &&
          subscriptionMap.value.get(channel.id) !==
            ChannelSubscribeLevel.notified
      )

      const unread = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) !==
            ChannelSubscribeLevel.notified &&
          !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...noticeable, ...starred, ...unread]
    }
    if (mode.value === 'starred') {
      const starred = channelsWithUnreadMessage.value.filter(channel =>
        starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      const notStarred = channelsWithUnreadMessage.value.filter(
        channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...starred, ...notStarred]
    }
    if (mode.value === 'notified') {
      const noticeable = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) ===
          ChannelSubscribeLevel.notified
      )
      const unread = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) !==
          ChannelSubscribeLevel.notified
      )
      return [...noticeable, ...unread]
    }

    return channelsWithUnreadMessage.value
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
