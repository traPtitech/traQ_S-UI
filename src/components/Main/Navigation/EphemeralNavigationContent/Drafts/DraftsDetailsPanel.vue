<template>
  <collapse-content>
    <drafts-details-panel-channel
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
import DraftsDetailsPanelChannel from './DraftsDetailsPanelChannel.vue'

export default defineComponent({
  name: 'DraftsDetailsPanel',
  components: {
    CollapseContent,
    DraftsDetailsPanelChannel
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
