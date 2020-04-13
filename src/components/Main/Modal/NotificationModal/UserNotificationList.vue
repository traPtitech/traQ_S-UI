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
import api from '@/lib/api'
import UserNotificationListItem from './UserNotificationListItem.vue'
import { UserId, ChannelId } from '@/types/entity-ids'
import { compareString } from '@/lib/util/string'

// TODO: BOTユーザーの除外、ユーザー検索、通知ONユーザーの上部表示、自分を変更した際の通知状況更新
const useChannelNotificationState = (props: { channelId: ChannelId }) => {
  const allUserIds = computed(() =>
    Object.entries(store.state.entities.users)
      .sort((e1, e2) => compareString(e1[1].name, e2[1].name))
      .map(e => e[0])
  )
  const state = reactive({
    subscribersMap: {} as Record<UserId, boolean>,
    subscriptionStateSorted: computed((): {
      userId: UserId
      subscribed: boolean
    }[] =>
      allUserIds.value.map(id => ({
        userId: id,
        subscribed: state.subscribersMap[id] ?? false
      }))
    )
  })
  api.getChannelSubscribers(props.channelId).then(result => {
    const subscribers = new Set(result.data)
    state.subscribersMap = Object.fromEntries(
      allUserIds.value.map(id => [id, subscribers.has(id)])
    )
  })
  const onChangeNotification = async (userId: UserId, subscribe: boolean) => {
    const newMap = { ...state.subscribersMap, [userId]: subscribe }
    try {
      await api.setChannelSubscribers(props.channelId, {
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
