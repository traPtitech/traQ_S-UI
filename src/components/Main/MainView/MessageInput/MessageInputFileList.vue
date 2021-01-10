<template>
  <div v-if="state.attachments.length > 0" :class="$style.container">
    <message-input-file-list-item
      v-for="(attachment, i) in state.attachments"
      :key="i"
      :attachment="attachment"
      :class="$style.element"
      @item-remove="removeAttachmentAt(i)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MessageInputFileListItem from './MessageInputFileListItem.vue'
import useMessageInputState from '@/providers/messageInputState'

export default defineComponent({
  name: 'MessageInputFileList',
  components: {
    MessageInputFileListItem
  },
  setup() {
    const { state, removeAttachmentAt } = useMessageInputState()
    return { state, removeAttachmentAt }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  display: flex;
  padding-top: 4px;
  padding-bottom: 6px;
  overflow-x: scroll;
}
.element {
  margin: 0 8px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}
</style>
