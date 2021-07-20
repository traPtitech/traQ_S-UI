<template>
  <div>
    <drafts-details-panel :input-channels="inputChannels" />
    <drafts-title-panel />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMessageInputStates } from '/@/providers/messageInputState'
import DraftsTitlePanel from './DraftsTitlePanel.vue'
import DraftsDetailsPanel from './DraftsDetailsPanel.vue'

export default defineComponent({
  name: 'Drafts',
  components: {
    DraftsDetailsPanel,
    DraftsTitlePanel
  },
  setup() {
    const { inputChannels } = useMessageInputStates()
    return { inputChannels }
  }
})
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
