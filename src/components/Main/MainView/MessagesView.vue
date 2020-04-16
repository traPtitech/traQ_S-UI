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
    <messages-scroller
      :message-ids="state.channelMessageIds"
      :entry-message-id="state.entryMessageId"
      :is-loading="loadMessagesState.isLoading"
      :last-loading-direction="loadMessagesState.lastLoadingDirection"
      :is-initial-load="loadMessagesState.isInitialLoad"
      @request-load-former="loadFormerMessages"
      @request-load-latter="loadLatterMessages"
    />
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
import { LoadingDirection } from '@/store/domain/messagesView/state'

const useFileDragDrop = (dropAreaRef: Ref<HTMLElement | null>) => {
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

const useLoadMessages = () => {
  const state = reactive({
    isLoading: false,
    lastLoadingDirection: computed(
      () => store.state.domain.messagesView.lastLoadingDirection
    ),
    isInitialLoad: computed(() => store.state.domain.messagesView.isInitialLoad)
  })
  const loadMessages = async (direction: 'former' | 'latter') => async () => {
    state.isLoading = true
    store.commit.domain.messagesView.setLastLoadingDirection(direction)
    if (direction === 'former') {
      await store.dispatch.domain.messagesView.fetchAndRenderChannelFormerMessages()
    } else {
      await store.dispatch.domain.messagesView.fetchAndRenderChannelLatterMessages()
    }
    if (store.state.domain.messagesView.isInitialLoad) {
      store.commit.domain.messagesView.setIsInitialLoad(false)
    }
    state.isLoading = false
  }
  const loadFormerMessages = loadMessages('former')
  const loadLatterMessages = loadMessages('latter')
  return { loadMessagesState: state, loadFormerMessages, loadLatterMessages }
}

export default defineComponent({
  name: 'MessagesView',
  components: { MessagesScroller, MessageInput, MessagesViewFileUploadOverlay },
  setup() {
    const state = reactive({
      channelMessageIds: computed(
        () => store.state.domain.messagesView.messageIds
      ),
      channelId: computed(
        () => store.state.domain.messagesView.currentChannelId
      ),
      entryMessageId: computed(
        () => store.state.domain.messagesView.entryMessageId
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
    const {
      loadMessagesState,
      loadFormerMessages,
      loadLatterMessages
    } = useLoadMessages()
    return {
      state,
      loadMessagesState,
      fileDragDropState,
      containerStyle,
      containerRef,
      onDrop,
      onDragOver,
      loadFormerMessages,
      loadLatterMessages
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
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
