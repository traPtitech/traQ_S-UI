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

<script lang="ts">
import { MessageInputState } from '/@/providers/messageInputState'
import { ChannelId } from '/@/types/entity-ids'
import { defineComponent, PropType } from 'vue'
import CollapseContent from '../CollapseContent.vue'
import DraftListDetailsPanelChannel from './DraftListDetailsPanelChannel.vue'

export default defineComponent({
  name: 'DraftListDetailsPanel',
  components: {
    CollapseContent,
    DraftListDetailsPanelChannel
  },
  props: {
    inputChannels: {
      type: Array as PropType<Array<[ChannelId, MessageInputState]>>,
      required: true
    }
  }
})
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
