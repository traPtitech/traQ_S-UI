<template>
  <div>
    <draft-list-details-panel :input-channels="inputChannels" />
    <draft-list-title-panel />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMessageInputStateBase } from '/@/store/ui/messageInputState'
import DraftListTitlePanel from './DraftListTitlePanel.vue'
import DraftListDetailsPanel from './DraftListDetailsPanel.vue'

export default defineComponent({
  name: 'DraftList',
  components: {
    DraftListDetailsPanel,
    DraftListTitlePanel
  },
  setup() {
    const { inputChannels } = useMessageInputStateBase()
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
