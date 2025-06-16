<template>
  <div :class="$style.container">
    <message-input-file-list-item-close-button
      :class="$style.closeButton"
      @click="emit('itemRemove')"
    />
    <message-input-file-list-item-image
      v-if="thumbnailDataUrl"
      :name="attachment.file.name"
      :src="thumbnailDataUrl"
    />
    <div v-else :class="$style.fileContainer">
      <file-type-icon :type="attachment.type" />
      <div :class="$style.fileName">
        {{ attachment.file.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MessageInputFileListItemImage from './MessageInputFileListItemImage.vue'
import MessageInputFileListItemCloseButton from './MessageInputFileListItemCloseButton.vue'
import FileTypeIcon from '/@/components/UI/FileTypeIcon.vue'
import type { Attachment } from '/@/store/ui/messageInputStateStore'
import useObjectURL from '/@/composables/dom/useObjectURL'
import { computed } from 'vue'

const props = defineProps<{
  attachment: Attachment
}>()

const emit = defineEmits<{
  (e: 'itemRemove'): void
}>()

const thumbnailDataUrl = useObjectURL(
  computed(() =>
    props.attachment.type === 'image' ? props.attachment.file : undefined
  )
)
</script>

<style lang="scss" module>
.container {
  position: relative;
}
.closeButton {
  position: absolute;
  right: 4px;
  top: 4px;
}
.fileContainer {
  @include background-primary;
  max-width: 128px;
  min-width: 80px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  border-radius: 4px;
}
.fileName {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
</style>
