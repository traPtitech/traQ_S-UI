<template>
  <div>
    <DraftListDetailsPanel :input-channels="inputChannels" />
    <DraftListTitlePanel />
  </div>
</template>

<script lang="ts" setup>
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

import DraftListDetailsPanel from './DraftListDetailsPanel.vue'
import DraftListTitlePanel from './DraftListTitlePanel.vue'

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
