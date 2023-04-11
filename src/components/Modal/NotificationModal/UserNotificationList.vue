<template>
  <div v-if="subscribers" :class="$style.container">
    <filter-input v-model="query" />
    <div :class="$style.list">
      <user-notification-list-item
        v-for="entry in subscriptionStateSorted"
        :key="entry.userId"
        :class="$style.item"
        :user-id="entry.userId"
        :subscribed="entry.subscribed"
        @change-notification="onChangeNotification"
      />
    </div>
  </div>
  <div v-else :class="$style.container">通知状態の取得に失敗しました</div>
</template>

<script lang="ts">
import { computed, ref, watch } from 'vue'
import apis from '/@/lib/apis'
import type { UserId, ChannelId } from '/@/types/entity-ids'
import { compareStringInsensitive } from '/@/lib/basic/string'
import useChannelSubscribers from '/@/composables/subscription/useChannelSubscribers'
import { useToastStore } from '/@/store/ui/toast'
import useTextFilter from '/@/composables/utils/useTextFilter'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'

const useChannelNotificationState = (props: { channelId: ChannelId }) => {
  const { myId } = useMeStore()
  const { addErrorToast } = useToastStore()
  const { activeUsersMap } = useUsersStore()
  const subscribers = useChannelSubscribers(props)

  const initialSubscribers = ref(new Set<string>())
  watch(subscribers, (newVal, oldVal) => {
    if (oldVal === undefined && newVal) {
      initialSubscribers.value = new Set(newVal)
    }
  })

  const allUsersWithoutMe = useUserList(
    computed(() => ['inactive', 'bot', ...(myId.value ? [myId.value] : [])])
  )

  const { query, filteredItems } = useTextFilter(allUsersWithoutMe, [
    'name',
    'displayName'
  ])

  const subscriptionStateSorted = computed(() =>
    filteredItems.value
      .map(u => ({
        userId: u.id,
        name: u.name,
        subscribed: subscribers.value?.has(u.id) ?? false
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

  return {
    query,
    subscribers,
    subscriptionStateSorted,
    onChangeNotification
  }
}
</script>

<script lang="ts" setup>
import UserNotificationListItem from './UserNotificationListItem.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import useUserList from '/@/composables/users/useUserList'

const props = defineProps<{
  channelId: string
}>()

const { query, subscribers, subscriptionStateSorted, onChangeNotification } =
  useChannelNotificationState(props)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  margin-top: 4px;
}
.list {
  height: 300px;
  margin-top: 4px;
  padding: 0 4px;
  overflow-y: scroll;
}
.item {
  margin: 16px 0;
}
</style>
