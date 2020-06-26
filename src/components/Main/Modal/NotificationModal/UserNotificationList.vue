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
import {
  defineComponent,
  computed,
  reactive,
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import apis from '@/lib/apis'
import UserNotificationListItem from './UserNotificationListItem.vue'
import { UserId, ChannelId } from '@/types/entity-ids'
import { compareString } from '@/lib/util/string'
import { ActiveUserMap } from '@/store/entities'

// TODO: ユーザー検索、自分を変更した際の通知状況更新
const useChannelNotificationState = (props: { channelId: ChannelId }) => {
  const allUsers = computed(() =>
    Object.values(store.getters.entities.activeUsers as ActiveUserMap).filter(
      // BOT除外
      u => !u.bot
    )
  )
  const state = reactive({
    initialSubscribers: new Set<string>(),
    subscribersMap: {} as Record<UserId, boolean | undefined>,
    subscriptionStateSorted: computed((): {
      userId: UserId
      name: string
      subscribed: boolean
    }[] =>
      allUsers.value
        .map(u => ({
          userId: u.id,
          name: u.name,
          subscribed: state.subscribersMap[u.id] ?? false
        }))
        .sort((u1, u2) => {
          const s1 = state.initialSubscribers.has(u1.userId)
          const s2 = state.initialSubscribers.has(u2.userId)
          return s1 && !s2
            ? -1
            : !s1 && s2
            ? 1
            : compareString(u1.name, u2.name)
        })
    )
  })
  apis.getChannelSubscribers(props.channelId).then(res => {
    state.initialSubscribers = new Set(res.data)
    state.subscribersMap = Object.fromEntries(res.data.map(uid => [uid, true]))
  })
  const onChangeNotification = async (userId: UserId, subscribe: boolean) => {
    const newMap = { ...state.subscribersMap, [userId]: subscribe }
    try {
      await apis.setChannelSubscribers(props.channelId, {
        on: Object.entries(newMap)
          .filter(e => e[1])
          .map(e => e[0])
      })
      state.subscribersMap = newMap
    } catch {}
  }
  return { ...toRefs(state), onChangeNotification }
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
