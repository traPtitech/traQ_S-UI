<template>
  <div
    v-if="message"
    ref="bodyRef"
    :class="$style.body"
    :data-is-mobile="$boolAttr(isMobile)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <message-tools
      :class="$style.tools"
      :show="isHovered"
      :message-id="messageId"
      is-minimum
    />
    <message-contents :class="$style.messageContents" :message-id="messageId" />
    <message-quote-list-item-footer :class="$style.footer" :message="message" />
  </div>
</template>

<script lang="ts" setup>
import MessageContents from './MessageContents.vue'
import MessageTools from './MessageTools.vue'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'
import { computed, shallowRef, toRef } from 'vue'
import type { MessageId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import type { ChangeHeightData } from './composables/useElementRenderObserver'
import useElementRenderObserver from './composables/useElementRenderObserver'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import useHover from '/@/composables/dom/useHover'
import { useMessagesStore } from '/@/store/entities/messages'

const props = defineProps<{
  messageId: MessageId
}>()

const emit = defineEmits<{
  (e: 'entryMessageLoaded', _relativePos: number): void
  (e: 'changeHeight', _data: ChangeHeightData): void
}>()

const { messagesMap } = useMessagesStore()

const bodyRef = shallowRef<HTMLDivElement | null>(null)
const { isMobile } = useResponsiveStore()
const message = computed(() => messagesMap.value.get(props.messageId))

const { embeddingsState } = useEmbeddings(props)

useElementRenderObserver(
  bodyRef,
  false,
  toRef(props, 'messageId'),
  embeddingsState,
  emit
)

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
  &:hover {
    background: var(--specific-message-hover-background);
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
