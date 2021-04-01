<template>
  <div :class="$style.container">
    <Files-view-content :channel-id="channelId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import FilesViewContent from './FilesViewContent.vue'

export default defineComponent({
  name: 'FilesView',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  components: { FilesViewContent },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-primary;
  width: 100%;
  height: 100%;
}
</style>
