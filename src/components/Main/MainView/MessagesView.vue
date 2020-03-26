<template>
  <div
    ref="containerRef"
    :class="$style.container"
    :style="containerStyle"
    @dragover.prevent.stop="onDragOver"
    @drop.prevent.stop="onDrop"
  >
    <messages-view-file-upload-overlay
      v-if="fileDragDropState.isDragging"
      :class="$style.fileUploadOverlay"
    />
    <messages-scroller :messageIds="state.channelMessageIds" />
    <message-input :channel-id="state.channelId" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  computed,
  ref,
  Ref
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessagesScroller from './MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import MessagesViewFileUploadOverlay from './MessagesViewFileUploadOverlay.vue'
import { debounce } from 'lodash-es'

type Props = {
  channelId: ChannelId
}
const useFileDragDrop = (dropAreaRef: Ref<HTMLElement | null>) => {
  const state = reactive({
    isDragging: false
  })
  const onDrop = (event: DragEvent) => {
    const files = event.dataTransfer?.files ?? ([] as File[])
    Array.from(files).forEach(file => {
      store.commit.ui.fileInput.addFile(file)
    })
    state.isDragging = false
  }

  /** ドラッグ終了判定するまでにdragoverが何ms開けばいいか */
  const dragoverResetDurationMs = 100
  const resetDraggingState = debounce(() => {
    state.isDragging = false
  }, dragoverResetDurationMs)
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
  name: 'MessagesView',
  props: { channelId: String },
  components: { MessagesScroller, MessageInput, MessagesViewFileUploadOverlay },
  setup(props: Props, _: SetupContext) {
    const state = reactive({
      channelMessageIds: computed(
        () => store.state.domain.messagesView.messageIds
      ),
      channelId: computed(
        () => store.state.domain.messagesView.currentChannelId
      )
    })

    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))

    const containerRef = ref<HTMLElement>(null)

    const { fileDragDropState, onDrop, onDragOver } = useFileDragDrop(
      containerRef
    )

    return {
      props,
      state,
      fileDragDropState,
      containerStyle,
      containerRef,
      onDrop,
      onDragOver
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;

.container {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  padding: 0 $messagePadding;
}

.fileUploadOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9999;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
