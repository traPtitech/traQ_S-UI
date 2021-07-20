<template>
  <div :class="$style.container">
    <message-input-file-list-item-close-button
      :class="$style.closeButton"
      @close="onClickClose"
    />
    <message-input-file-list-item-image
      v-if="state.showThumbnail"
      :attachment="attachment"
    />
    <div v-else :class="$style.fileContainer">
      <file-type-icon :type="attachment.type" />
      <div :class="$style.fileName">{{ attachment.file.name }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, PropType } from 'vue'
import MessageInputFileListItemImage from './MessageInputFileListItemImage.vue'
import MessageInputFileListItemCloseButton from './MessageInputFileListItemCloseButton.vue'
import FileTypeIcon from '/@/components/UI/FileTypeIcon.vue'
import { Attachment } from '/@/providers/messageInputState'

export default defineComponent({
  name: 'MessageInputFileListItem',
  components: {
    MessageInputFileListItemImage,
    MessageInputFileListItemCloseButton,
    FileTypeIcon
  },
  props: {
    attachment: {
      type: Object as PropType<Attachment>,
      required: true
    }
  },
  setup(props, context) {
    const state = reactive({
      showThumbnail: computed((): boolean =>
        props.attachment.type === 'image' && props.attachment.thumbnailDataUrl
          ? props.attachment.thumbnailDataUrl.length > 0
          : false
      )
    })
    const onClickClose = () => context.emit('itemRemove')

    return { state, onClickClose }
  }
})
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
