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
import { toRef } from 'vue';
import useChannelSubscriptionState from '/@/composables/useChannelSubscriptionState'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { ChannelId } from '/@/types/entity-ids'

const levels: ReadonlyArray<ChannelSubscribeLevel> = [
  ChannelSubscribeLevel.none,
  ChannelSubscribeLevel.subscribed,
  ChannelSubscribeLevel.notified
]
</script>

<script lang="ts" setup>
import NotificationStateSelectorItem from './NotificationStateSelectorItem.vue';

const props = defineProps<{
    channelId: ChannelId
}>();

const { currentChannelSubscription, changeSubscriptionLevel } =
  useChannelSubscriptionState(toRef(props, 'channelId'))
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
