<template>
  <div :class="$style.container">
    <message-file-list-item-content :file-id="fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { FileId } from '/@/types/entity-ids'
import MessageFileListItemContent from './MessageFileListItemContent.vue'

export default defineComponent({
  name: 'MessageFileListFile',
  components: { MessageFileListItemContent },
  props: {
    fileId: {
      type: String as PropType<FileId>,
      default: ''
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  max-width: 400px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
    color: $theme-ui-secondary;
  }
  overflow: hidden;
  cursor: pointer;
}
</style>
