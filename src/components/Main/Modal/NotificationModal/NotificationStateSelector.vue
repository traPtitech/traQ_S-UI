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
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
import useChannelSubscriptionState from '@/use/channelSubscriptionState'
import NotificationStateSelectorItem from './NotificationStateSelectorItem.vue'
import { SubscriptionLevel } from '@/store/domain/me'

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
