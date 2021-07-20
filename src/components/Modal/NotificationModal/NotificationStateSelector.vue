<template>
  <div>
    <notification-state-selector-item
      v-for="level in levels"
      :key="level"
      :class="$style.item"
      :subscription-level="level"
      :is-selected="level === currentChannelSubscription"
      @click="changeSubscriptionLevel(level)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useChannelSubscriptionState from '/@/use/channelSubscriptionState'
import NotificationStateSelectorItem from './NotificationStateSelectorItem.vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'

const levels: ReadonlyArray<ChannelSubscribeLevel> = [
  ChannelSubscribeLevel.none,
  ChannelSubscribeLevel.subscribed,
  ChannelSubscribeLevel.notified
]

export default defineComponent({
  name: 'NotificationStateSelector',
  components: {
    NotificationStateSelectorItem
  },
  setup() {
    const { currentChannelSubscription, changeSubscriptionLevel } =
      useChannelSubscriptionState()
    return { currentChannelSubscription, changeSubscriptionLevel, levels }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
