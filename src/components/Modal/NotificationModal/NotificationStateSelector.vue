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
import { defineComponent, PropType, toRef } from 'vue'
import useChannelSubscriptionState from '/@/use/channelSubscriptionState'
import NotificationStateSelectorItem from './NotificationStateSelectorItem.vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { ChannelId } from '/@/types/entity-ids'

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
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const { currentChannelSubscription, changeSubscriptionLevel } =
      useChannelSubscriptionState(toRef(props, 'channelId'))
    return { currentChannelSubscription, changeSubscriptionLevel, levels }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
