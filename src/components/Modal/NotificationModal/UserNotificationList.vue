<template>
  <div v-if="subscribers" :class="$style.container">
    <user-notification-list-item
      v-for="entry in subscriptionStateSorted"
      :key="entry.userId"
      :class="$style.item"
      :user-id="entry.userId"
      :subscribed="entry.subscribed"
      @change-notification="onChangeNotification"
    />
  </div>
  <div v-else :class="$style.container">通知状態の取得に失敗しました</div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import store from '@/store'
import apis from '@/lib/apis'
import UserNotificationListItem from './UserNotificationListItem.vue'
import { UserId, ChannelId } from '@/types/entity-ids'
import { compareStringInsensitive } from '@/lib/util/string'
import useChannelSubscribers from '@/use/channelSubscribers'
import useToastStore from '@/use/toastStore'

const useChannelNotificationState = (props: { channelId: ChannelId }) => {
  const { addErrorToast } = useToastStore()
  const subscribers = useChannelSubscribers(props)

  const initialSubscribers = ref(new Set<string>())
  watch(subscribers, (newVal, oldVal) => {
    if (oldVal === undefined && newVal) {
      initialSubscribers.value = new Set(newVal)
    }
  })

  const allUsersWithoutMe = computed(() =>
    [...store.getters.entities.activeUsersMap.values()].filter(
      // BOTと自分を除外
      u => !u.bot && u.id !== store.getters.domain.me.myId
    )
  )

  const subscriptionStateSorted = computed(() =>
    allUsersWithoutMe.value
      .map(u => ({
        userId: u.id,
        name: u.name,
        subscribed: subscribers.value?.has(u.id)
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)

      addErrorToast('通知設定の変更に失敗しました')
    }
  }

  return { subscribers, subscriptionStateSorted, onChangeNotification }
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
      subscribers,
      subscriptionStateSorted,
      onChangeNotification
    } = useChannelNotificationState(props)
    return { subscribers, subscriptionStateSorted, onChangeNotification }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
}
.item {
  margin: 16px 0;
}
</style>
