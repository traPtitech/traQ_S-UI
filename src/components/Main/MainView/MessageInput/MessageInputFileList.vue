<template>
  <div v-if="state.attachments.length > 0" :class="$style.container">
    <message-input-file-list-item
      v-for="(attachment, i) in state.attachments"
      :key="i"
      :attachment="attachment"
      :class="$style.element"
      @item-remove="removeItem(i)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import MessageInputFileListItem from './MessageInputFileListItem.vue'

export default defineComponent({
  name: 'MessageInputFileList',
  components: {
    MessageInputFileListItem
  },
  setup() {
    const state = reactive({
      attachments: computed(() => store.state.ui.fileInput.attachments)
    })
    const removeItem = (indexStr: string) => {
      const index = parseInt(indexStr)
      store.commit.ui.fileInput.removeAttachmentAt(index)
    }
    return { state, removeItem }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  display: flex;
  padding: 16px;
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
