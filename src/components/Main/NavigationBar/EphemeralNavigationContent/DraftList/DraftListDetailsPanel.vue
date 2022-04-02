<template>
  <collapse-content>
    <draft-list-details-panel-channel
      v-for="[channelId, state] in inputChannels"
      :key="channelId"
      :class="$style.channel"
      :state="state"
      :channel-id="channelId"
    />
  </collapse-content>
</template>

<script lang="ts" setup>
import CollapseContent from '../CollapseContent.vue'
import DraftListDetailsPanelChannel from './DraftListDetailsPanelChannel.vue'
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'
import type { ChannelId } from '/@/types/entity-ids'

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
