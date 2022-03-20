<template>
  <div
    :class="$style.container"
    @dragstart.stop="onDragStart"
    @dragover.prevent.stop="onDragOver"
    @drop.prevent.stop="onDrop"
  >
    <channel-view-content-file-upload-overlay
      v-if="canDrop"
      :class="$style.fileUploadOverlay"
    />
    <channel-view-content-main
      :channel-id="channelId"
      :entry-message-id="entryMessageId"
    />
  </div>
</template>

<script lang="ts">
import { computed, ref, Ref, toRef } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { debounce, throttle } from 'throttle-debounce'
import { useMessageInputStateAttachment } from '/@/store/ui/messageInputState'
import { useToastStore } from '/@/store/ui/toast'

const useDragDrop = (channelId: Ref<ChannelId>) => {
  const { addErrorToast } = useToastStore()
  const { addFromDataTransfer } = useMessageInputStateAttachment(
    channelId,
    addErrorToast
  )

  // itemsはsafariには存在しない
  const hasFilesOrItems = (dt: DataTransfer) =>
    dt.files.length > 0 || dt.items?.length > 0

  const isDragging = ref(false)
  /** ドラッグがtraQの画面からスタートしたかどうか */
  const isDragStartInside = ref(false)
  const canDrop = computed(() => isDragging.value && !isDragStartInside.value)

  const onDrop = (event: DragEvent) => {
    if (canDrop.value && event.dataTransfer) {
      addFromDataTransfer(event.dataTransfer)
    }
    isDragging.value = false
    isDragStartInside.value = false
  }
  const onDragStart = (event: DragEvent) => {
    isDragStartInside.value = true
  }

  /** ドラッグ終了判定するまでにdragoverが何ms開けばいいか */
  const dragoverResetDurationMs = 150
  const resetDraggingState = debounce(dragoverResetDurationMs, () => {
    isDragging.value = false
    isDragStartInside.value = false
  })
  const onDragOver = throttle(50, (event: DragEvent) => {
    if (event.dataTransfer && hasFilesOrItems(event.dataTransfer)) {
      isDragging.value = true
    }
    resetDraggingState()
  })
  return {
    canDrop,
    onDrop,
    onDragStart,
    onDragOver
  }
}
</script>

<script lang="ts" setup>
import ChannelViewContentMain from './ChannelViewContentMain.vue'
import ChannelViewContentFileUploadOverlay from './ChannelViewContentFileUploadOverlay.vue'

const props = defineProps<{
  channelId: ChannelId
  entryMessageId?: ChannelId
}>()

const { canDrop, onDrop, onDragStart, onDragOver } = useDragDrop(
  toRef(props, 'channelId')
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
  background: var(--specific-main-view-background);
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