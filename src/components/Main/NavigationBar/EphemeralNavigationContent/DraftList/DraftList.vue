<template>
  <div>
    <draft-list-details-panel :input-channels="inputChannels" />
    <draft-list-title-panel />
  </div>
</template>

<script lang="ts" setup>
import DraftListTitlePanel from './DraftListTitlePanel.vue'
import DraftListDetailsPanel from './DraftListDetailsPanel.vue'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

const { inputChannels } = useMessageInputStateStore()
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}
.control {
  flex: 0 1 64px;
}
</style>
