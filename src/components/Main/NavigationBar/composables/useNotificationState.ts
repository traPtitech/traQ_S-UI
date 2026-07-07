import type { Ref } from 'vue'
import { computed, reactive } from 'vue'

import { deepSome } from '/@/lib/basic/tree'
import { useStarredChannels } from '/@/store/domain/starredChannels'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'

const useNotificationState = <T extends { id: ChannelId; children: T[] }>(
  channelTree: Ref<{ id: ChannelId; children?: T[] }>
) => {
  const { unreadChannelsMap, getSubscriptionLevel } = useSubscriptionStore()
  const unreadChannel = computed(() =>
    unreadChannelsMap.value.get(channelTree.value.id)
  )
  const starredChannelStore = useStarredChannels()

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() => {
      if (channelTree.value.children === undefined) return false
      const tree = channelTree.value as T // childrenが存在することをチェックしたため
      return deepSome(tree, channel => unreadChannelsMap.value.has(channel.id))
    }),
    unreadCount: computed(() => unreadChannel.value?.count),
    isNoticeable: computed(() => unreadChannel.value?.noticeable),
    isStarred: computed(
      () =>
        !!unreadChannel.value &&
        starredChannelStore.starredChannelSet.value.has(
          unreadChannel.value.channelId
        )
    ),
    subscriptionLevel: computed(() =>
      getSubscriptionLevel(channelTree.value.id)
    )
  })
  return notificationState
}

export default useNotificationState
