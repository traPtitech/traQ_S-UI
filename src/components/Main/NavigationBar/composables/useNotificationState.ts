import type { Ref } from 'vue'
import { computed, reactive } from 'vue'
import { deepSome } from '/@/lib/basic/tree'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'

const useNotificationState = <T extends { id: ChannelId; children: T[] }>(
  channelTree: Ref<{ id: ChannelId; children?: T[] }>
) => {
  const { unreadChannelsMap } = useSubscriptionStore()
  const unreadChannel = computed(() =>
    unreadChannelsMap.value.get(channelTree.value.id)
  )

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() => {
      if (channelTree.value.children === undefined) return false
      const tree = channelTree.value as T // childrenが存在することをチェックしたため
      return deepSome(tree, channel => unreadChannelsMap.value.has(channel.id))
    }),
    unreadCount: computed(() => unreadChannel.value?.count),
    isNoticeable: computed(() => unreadChannel.value?.noticeable),
    oldestMessageId: computed(() => unreadChannel.value?.oldestMessageId)
  })
  return notificationState
}

export default useNotificationState
