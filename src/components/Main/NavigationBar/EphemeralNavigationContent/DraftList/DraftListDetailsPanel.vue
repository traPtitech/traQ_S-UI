<template>
  <CollapseContent>
    <DraftListDetailsPanelChannel
      v-for="[channelId, state] in inputChannels"
      :key="channelId"
      :class="$style.channel"
      :state="state"
      :channel-id="channelId"
    />
  </CollapseContent>
</template>

<script lang="ts" setup>
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'
import type { ChannelId } from '/@/types/entity-ids'

import CollapseContent from '../CollapseContent.vue'
import DraftListDetailsPanelChannel from './DraftListDetailsPanelChannel.vue'

defineProps<{
  inputChannels: Array<[ChannelId, MessageInputState]>
}>()
</script>

<style lang="scss" module>
.channel {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
