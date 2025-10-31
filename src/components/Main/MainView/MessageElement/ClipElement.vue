<template>
  <ClickOutside :enabled="isHovered" @click-outside="onClickOutside">
    <div
      v-if="message"
      ref="bodyRef"
      :class="$style.body"
      :data-is-mobile="$boolAttr(isMobile)"
      :data-is-editing="$boolAttr(isEditing)"
      :data-is-active="$boolAttr(isActive)"
      @pointerenter="onPointerEnter"
      @click="onClick"
      @mouseleave="onMouseLeave"
    >
      <MessageTools
        v-model:is-active="isActive"
        :class="$style.tools"
        :show="showMessageTools"
        :message-id="messageId"
        is-minimum
      />
      <MessageContents
        :class="$style.messageContents"
        :message-id="messageId"
      />
      <MessageQuoteListItemFooter :class="$style.footer" :message="message" />
    </div>
  </ClickOutside>
</template>

<script lang="ts" setup>
import { computed, shallowRef, toRef } from 'vue'
import type { ChangeHeightData } from './composables/useElementRenderObserver'
import useElementRenderObserver from './composables/useElementRenderObserver'
import MessageContents from './MessageContents.vue'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'
import MessageTools, { useMessageToolsHover } from './MessageTools.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import { useMessagesStore } from '/@/store/entities/messages'
import useResponsive from '/@/composables/useResponsive'
import type { MessageId } from '/@/types/entity-ids'
import { ref } from 'vue'
import { useMessageEditingStateStore } from '/@/store/ui/messageEditingStateStore'

const props = defineProps<{
  messageId: MessageId
}>()

const emit = defineEmits<{
  (e: 'entryMessageLoaded', _relativePos: number): void
  (e: 'changeHeight', _data: ChangeHeightData): void
}>()

const isActive = ref(false)

const { messagesMap } = useMessagesStore()

const { editingMessageId } = useMessageEditingStateStore()
const isEditing = computed(() => props.messageId === editingMessageId.value)

const bodyRef = shallowRef<HTMLDivElement | null>(null)
const { isMobile } = useResponsive()
const message = computed(() => messagesMap.value.get(props.messageId))

const { embeddingsState } = useEmbeddings(props)

useElementRenderObserver(
  bodyRef,
  false,
  toRef(props, 'messageId'),
  embeddingsState,
  emit
)

const { isHovered, onPointerEnter, onClick, onMouseLeave, onClickOutside } =
  useMessageToolsHover()
const showMessageTools = computed(
  () => (isHovered.value && !isEditing.value) || isActive.value
)
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
  &:not([data-is-editing]) {
    &[data-is-active],
    &:hover {
      background: var(--specific-message-hover-background);
    }
  }
}

.messageContents {
  grid-area: message-contents;
  min-width: 0;
}

.tools {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: $z-index-message-element-tools;
}

.footer {
  margin-top: 4px;
  margin-left: 42px;
}
</style>
