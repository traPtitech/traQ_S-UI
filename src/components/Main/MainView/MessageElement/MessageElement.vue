<template>
  <div
    v-if="state.message"
    ref="bodyRef"
    :class="$style.body"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-pinned="$boolAttr(state.isPinned)"
    :data-is-entry="$boolAttr(isEntryMessage)"
    :data-is-editing="$boolAttr(state.isEditing)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <message-pinned
      v-if="state.message.pinned"
      :message-id="messageId"
      :class="$style.pinned"
    />
    <message-tools
      :show="isHovered && !state.isEditing"
      :class="$style.tools"
      :style="toolStyle"
      :message-id="messageId"
      :is-minimum="isArchived"
    />
    <message-contents
      :class="$style.messageContents"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
    <message-stamp-list
      :show-detail-button="isHovered"
      :message-id="messageId"
      :stamps="state.message.stamps"
      :is-archived="isArchived"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, shallowRef, PropType } from 'vue'
import store from '/@/store'
import { MessageId } from '/@/types/entity-ids'
import useIsMobile from '/@/use/isMobile'
import useSidebar from '/@/use/sidebar'
import MessageStampList from './MessageStampList.vue'
import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from '/@/use/message/embeddings'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import MessageTools from './MessageTools.vue'
import useHover from '/@/use/hover'

export default defineComponent({
  name: 'MessageElement',
  components: {
    MessageContents,
    MessageStampList,
    MessagePinned,
    MessageTools
  },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isEntryMessage: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const bodyRef = shallowRef<HTMLDivElement | null>(null)
    const { isMobile } = useIsMobile()

    const { isSidebarOpen } = useSidebar()

    const toolsPaddingWithSidebar = '50px'
    const toolsPadding = '16px'
    interface PaddingStyle {
      '--padding': string
    }
    const toolStyle = computed<PaddingStyle>(() => {
      if (isSidebarOpen.value && !isMobile.value) {
        return {
          '--padding': toolsPadding
        }
      } else {
        return {
          '--padding': toolsPaddingWithSidebar
        }
      }
    })

    const state = reactive({
      message: computed(() =>
        store.state.entities.messages.messagesMap.get(props.messageId)
      ),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap.get(
            props.messageId
          ) ?? ''
      ),
      rawContent: computed(
        () =>
          store.state.entities.messages.messagesMap.get(props.messageId)
            ?.content ?? ''
      ),
      isEditing: computed(
        () =>
          props.messageId === store.state.domain.messagesView.editingMessageId
      ),
      isPinned: computed((): boolean => state.message?.pinned ?? false)
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    const { isHovered, onMouseEnter, onMouseLeave } = useHover()

    return {
      state,
      bodyRef,
      embeddingsState,
      isMobile,
      isHovered,
      toolStyle,
      onMouseEnter,
      onMouseLeave
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;
$messagePaddingMobile: 16px;

.body {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  overflow: clip;
  padding: 8px $messagePadding;
  &[data-is-mobile] {
    padding: 8px $messagePaddingMobile;
  }
  &[data-is-pinned] {
    background: $common-background-pin;
  }
  &[data-is-entry] {
    // TODO: 色を正しくする
    background: $common-background-pin;
  }
  &:not([data-is-editing]):not([data-is-pinned]):not([data-is-entry]):hover {
    // TODO: 色を正しくする
    background: $theme-background-secondary--05;
  }
}

.pinned {
  padding: {
    top: 4px;
    bottom: 8px;
  }
}

.messageContents {
  min-width: 0;
}

.tools {
  position: absolute;
  top: 4px;
  right: var(--padding);
  z-index: $z-index-message-element-tools;
}
</style>
