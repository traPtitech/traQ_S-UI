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
    <main-view :channel-id="channelId" />
    <channel-side-bar :channel-id="channelId" />
    <portal-target name="sidebar" v-if="!isMobile" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  ref,
  Ref,
  PropType
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useIsMobile from '@/use/isMobile'
import MainView from './MainView.vue'
import ChannelSideBar from '@/components/Main/MainView/ChannelSideBar/ChannelSideBar.vue'
import MessagesViewFileUploadOverlay from './MessagesViewFileUploadOverlay.vue'
import { debounce } from 'lodash-es'

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

export default defineComponent({
  name: 'MessagesView',
  props: { channelId: { type: String as PropType<ChannelId>, required: true } },
  components: {
    MainView,
    MessagesViewFileUploadOverlay,
    ChannelSideBar
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

    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))

    const containerRef = ref<HTMLElement>(null)

    const { fileDragDropState, onDrop, onDragOver } = useFileDragDrop(
      containerRef
    )
    const { isMobile } = useIsMobile()

    return {
      state,
      fileDragDropState,
      containerStyle,
      containerRef,
      onDrop,
      onDragOver,
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
.container {
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
  z-index: 9999;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
