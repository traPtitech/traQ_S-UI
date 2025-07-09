import type { Ref } from 'vue'
import { computed, reactive } from 'vue'
import { deepSome } from '/@/lib/basic/tree'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useChannelsStore } from '/@/store/entities/channels'

const useNotificationState = <T extends { id: ChannelId; children: T[] }>(
  channelTree: Ref<{ id: ChannelId; children?: T[] }>
) => {
  const { unreadChannelsMap, subscriptionMap } = useSubscriptionStore()
  const { channelsMap } = useChannelsStore()
  const unreadChannel = computed(() =>
    unreadChannelsMap.value.get(channelTree.value.id)
  )
  const starredChannelStore = useStaredChannels()

  const isStarred = computed(() => {
    const checkChannelIsStarred = (channelId: string): boolean => {
      if (starredChannelStore.staredChannelSet.value.has(channelId)) {
        return true
      }

      const channel = channelsMap.value.get(channelId)
      if (!channel?.parentId) {
        return false
      }

      return checkChannelIsStarred(channel.parentId)
    }

    return checkChannelIsStarred(channelTree.value.id)
  })

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() => {
      if (channelTree.value.children === undefined) return false
      const tree = channelTree.value as T // childrenが存在することをチェックしたため
      return deepSome(tree, channel => unreadChannelsMap.value.has(channel.id))
    }),
    unreadCount: computed(() => unreadChannel.value?.count),
    isNoticeable: computed(() => unreadChannel.value?.noticeable),
    isStarred,
    subscriptionLevel: computed(
      () =>
        subscriptionMap.value.get(channelTree.value.id) ??
        ChannelSubscribeLevel.none
    )
  })
  return notificationState
}

export default useNotificationState
