<template>
  <div
    v-if="message"
    ref="bodyRef"
    :class="$style.body"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-pinned="$boolAttr(message.pinned)"
    :data-is-entry="$boolAttr(isEntryMessage)"
    :data-is-editing="$boolAttr(isEditing)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <message-pinned
      v-if="message.pinned"
      :message-id="messageId"
      :class="$style.pinned"
    />
    <message-tools
      :show="isHovered && !isEditing"
      :class="$style.tools"
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
      :stamps="message.stamps"
      :is-archived="isArchived"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, shallowRef, PropType } from 'vue'
import store from '/@/vuex'
import { MessageId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import MessageStampList from './MessageStampList.vue'
import useElementRenderObserver, {
  ChangeHeightData
} from './use/elementRenderObserver'
import useEmbeddings from '/@/use/message/embeddings'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import MessageTools from '/@/components/Main/MainView/MessageElement/MessageTools.vue'
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
  emits: {
    entryMessageLoaded: (_relativePos: number) => true,
    changeHeight: (_data: ChangeHeightData) => true
  },
  setup(props, { emit }) {
    const bodyRef = shallowRef<HTMLDivElement | null>(null)
    const { isMobile } = useResponsiveStore()
    const message = computed(() =>
      store.state.entities.messages.messagesMap.get(props.messageId)
    )
    const isEditing = computed(
      () => props.messageId === store.state.domain.messagesView.editingMessageId
    )

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, message, embeddingsState, emit)

    const { isHovered, onMouseEnter, onMouseLeave } = useHover()

    return {
      message,
      bodyRef,
      embeddingsState,
      isMobile,
      isEditing,
      isHovered,
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
    background: var(--specific-message-hover-background);
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
  right: 16px;
  z-index: $z-index-message-element-tools;
}
</style>
