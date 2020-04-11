<template>
  <div>
    <notification-state-selector-item
      v-for="level in levels"
      :key="level"
      :class="$style.item"
      :subscription-level="level"
      :is-selected="level === currentChannelSubscription"
      @click.native="changeSubscriptionLevel(level)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import NotificationStateSelectorItem from './NotificationStateSelectorItem.vue'
import { SubscriptionLevel } from '@/store/domain/me'

const useChannelSubscriptionState = () => {
  const currentChannelId = computed(
    () => store.state.domain.messagesView.currentChannelId
  )
  const currentChannelSubscription = computed(
    () =>
      store.state.domain.me.subscriptionMap[currentChannelId.value] ?? 'none'
  )
  const changeSubscriptionLevel = (level: SubscriptionLevel) => {
    store.dispatch.domain.me.changeSubscriptionLevel({
      channelId: currentChannelId.value,
      subscriptionLevel: level
    })
  }
  const changeNextSubscriptionLevel = () => {
    const level =
      currentChannelSubscription.value === 'notified'
        ? 'none'
        : currentChannelSubscription.value === 'subscribed'
        ? 'notified'
        : 'subscribed'
  }
  return {
    currentChannelSubscription,
    changeSubscriptionLevel,
    changeNextSubscriptionLevel
  }
}

const levels: SubscriptionLevel[] = ['notified', 'subscribed', 'none']

export default defineComponent({
  name: 'NotificationStateSelector',
  components: {
    NotificationStateSelectorItem
  },
  setup() {
    const {
      currentChannelSubscription,
      changeSubscriptionLevel
    } = useChannelSubscriptionState()
    return { currentChannelSubscription, changeSubscriptionLevel, levels }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
