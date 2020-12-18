<template>
  <div
    :class="$style.container"
    @dragover.prevent.stop="onDragOver"
    @drop.prevent.stop="onDrop"
  >
    <channel-view-file-upload-overlay
      v-if="fileDragDropState.isDragging"
      :class="$style.fileUploadOverlay"
    />
    <channel-view-content
      :channel-id="channelId"
      :entry-message-id="entryMessageId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import store from '@/_store'
import ChannelViewContent from './ChannelViewContent.vue'
import ChannelViewFileUploadOverlay from './ChannelViewFileUploadOverlay.vue'
import { debounce } from 'throttle-debounce'

const useFileDragDrop = () => {
  const state = reactive({
    isDragging: false
  })
  const onDrop = (event: DragEvent) => {
    const files = event.dataTransfer?.files ?? ([] as File[])
    Array.from(files).forEach(file => {
      store.dispatch.ui.fileInput.addAttachment(file)
    })
    state.isDragging = false
  }

  /** ドラッグ終了判定するまでにdragoverが何ms開けばいいか */
  const dragoverResetDurationMs = 100
  const resetDraggingState = debounce(dragoverResetDurationMs, () => {
    state.isDragging = false
  })
  const onDragOver = (event: DragEvent) => {
    state.isDragging = true
    resetDraggingState()
  }
  return {
    fileDragDropState: state,
    onDrop,
    onDragOver
  }
}

export default defineComponent({
  name: 'ChannelView',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    entryMessageId: String as PropType<ChannelId>
  },
  components: {
    ChannelViewContent,
    ChannelViewFileUploadOverlay
  },
  setup() {
    const state = reactive({
      channelMessageIds: computed(
        () => store.state.domain.messagesView.messageIds
      ),
      channelId: computed(
        () => store.state.domain.messagesView.currentChannelId
      )
    })

    const { fileDragDropState, onDrop, onDragOver } = useFileDragDrop()

    return {
      state,
      fileDragDropState,
      onDrop,
      onDragOver
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-primary;
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
}

.fileUploadOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: $z-index-file-upload-overlay;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
