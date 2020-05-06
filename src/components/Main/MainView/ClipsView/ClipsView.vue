<template>
  <div :class="$style.container">
    <clips-view-content :clip-folder-id="clipFolderId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import ClipsViewContent from './ClipsViewContent.vue'

export default defineComponent({
  name: 'ClipsView',
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  components: { ClipsViewContent },
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
