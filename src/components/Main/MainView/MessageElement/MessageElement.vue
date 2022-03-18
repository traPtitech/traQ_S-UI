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

<script lang="ts" setup>
import MessageStampList from './MessageStampList.vue'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import MessageTools from '/@/components/Main/MainView/MessageElement/MessageTools.vue'
import { computed, shallowRef } from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import useElementRenderObserver, {
  ChangeHeightData
} from './composables/useElementRenderObserver'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import useHover from '/@/composables/dom/useHover'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'

const props = withDefaults(
  defineProps<{
    messageId: MessageId
    isEntryMessage?: boolean
    isArchived?: boolean
  }>(),
  {
    isEntryMessage: false,
    isArchived: false
  }
)

const emit = defineEmits<{
  (e: 'entryMessageLoaded', _relativePos: number): void
  (e: 'changeHeight', _data: ChangeHeightData): void
}>()

const { editingMessageId } = useMessagesView()
const bodyRef = shallowRef<HTMLDivElement | null>(null)
const { isMobile } = useResponsiveStore()
const { messagesMap } = useMessagesStore()
const message = computed(() => messagesMap.value.get(props.messageId))
const isEditing = computed(() => props.messageId === editingMessageId.value)

const { embeddingsState } = useEmbeddings(props)

useElementRenderObserver(bodyRef, props, message, embeddingsState, emit)

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
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
