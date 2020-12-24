<template>
  <div :class="$style.container">
    <user-notification-list-item
      v-for="entry in subscriptionStateSorted"
      :key="entry.userId"
      :class="$style.item"
      :user-id="entry.userId"
      :subscribed="entry.subscribed"
      @change-notification="onChangeNotification"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import store from '@/store'
import apis from '@/lib/apis'
import UserNotificationListItem from './UserNotificationListItem.vue'
import { UserId, ChannelId } from '@/types/entity-ids'
import { compareStringInsensitive } from '@/lib/util/string'
import useChannelSubscribers from '@/use/channelSubscribers'

// TODO: ユーザー検索、自分を変更した際の通知状況更新
const useChannelNotificationState = (props: { channelId: ChannelId }) => {
  const subscribers = useChannelSubscribers(props)

  const initialSubscribers = ref(new Set<string>())
  watch(subscribers, (newVal, oldVal) => {
    if (oldVal === undefined && newVal) {
      initialSubscribers.value = new Set(newVal)
    }
  })

  const allUsers = computed(() =>
    [...store.getters.entities.activeUsersMap.values()].filter(
      // BOT除外
      u => !u.bot
    )
  )

  const subscriptionStateSorted = computed(() =>
    allUsers.value
      .map(u => ({
        userId: u.id,
        name: u.name,
        subscribed: subscribers.value.has(u.id)
      }))
      .sort((u1, u2) => {
        const s1 = initialSubscribers.value.has(u1.userId)
        const s2 = initialSubscribers.value.has(u2.userId)
        return s1 && !s2
          ? -1
          : !s1 && s2
          ? 1
          : compareStringInsensitive(u1.name, u2.name)
      })
  )

  const onChangeNotification = async (userId: UserId, subscribe: boolean) => {
    try {
      await apis.editChannelSubscribers(props.channelId, {
        [subscribe ? 'on' : 'off']: [userId]
      })
    } catch {
      // TODO: エラー表示
    }
  }

  return { subscriptionStateSorted, onChangeNotification }
}

export default defineComponent({
  name: 'UserNotificationList',
  components: {
    UserNotificationListItem
  },
  props: {
    channelId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const {
      subscriptionStateSorted,
      onChangeNotification
    } = useChannelNotificationState(props)
    return { subscriptionStateSorted, onChangeNotification }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
