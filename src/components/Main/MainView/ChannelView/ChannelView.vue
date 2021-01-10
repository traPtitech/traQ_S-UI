<template>
  <div
    :class="$style.container"
    @dragover.prevent.stop="onDragOver"
    @drop.prevent.stop="onDrop"
  >
    <channel-view-file-upload-overlay
      v-if="isDragging"
      :class="$style.fileUploadOverlay"
    />
    <channel-view-content
      :channel-id="channelId"
      :entry-message-id="entryMessageId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, Ref, toRef } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import ChannelViewContent from './ChannelViewContent.vue'
import ChannelViewFileUploadOverlay from './ChannelViewFileUploadOverlay.vue'
import { debounce } from 'throttle-debounce'
import useMessageInputState from '@/providers/messageInputState'

const useDragDrop = (channelId: Ref<ChannelId>) => {
  const { addFromDataTransfer } = useMessageInputState(channelId)

  // itemsはsafariには存在しない
  const hasFilesOrItems = (dt: DataTransfer) =>
    dt.files.length > 0 || dt.items?.length > 0

  const isDragging = ref(false)
  const onDrop = (event: DragEvent) => {
    if (event.dataTransfer) {
      addFromDataTransfer(event.dataTransfer)
    }
    isDragging.value = false
  }

  /** ドラッグ終了判定するまでにdragoverが何ms開けばいいか */
  const dragoverResetDurationMs = 100
  const resetDraggingState = debounce(dragoverResetDurationMs, () => {
    isDragging.value = false
  })
  const onDragOver = (event: DragEvent) => {
    if (event.dataTransfer && hasFilesOrItems(event.dataTransfer)) {
      isDragging.value = true
    }
    resetDraggingState()
  }
  return {
    isDragging,
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
  setup(props) {
    const channelMessageIds = computed(
      () => store.state.domain.messagesView.messageIds
    )

    const { isDragging, onDrop, onDragOver } = useDragDrop(
      toRef(props, 'channelId')
    )

    return {
      channelMessageIds,
      isDragging,
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
