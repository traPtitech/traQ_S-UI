<template>
  <div
    v-if="message"
    ref="bodyRef"
    :class="$style.body"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-entry="$boolAttr(isEntryMessage)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <message-tools
      :class="$style.tools"
      :show="isHovered"
      :message-id="messageId"
      is-minimum
    />
    <message-contents
      :class="$style.messageContents"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
    <message-quote-list-item-footer :class="$style.footer" :message="message" />
  </div>
</template>

<script lang="ts" setup>
import MessageContents from './MessageContents.vue';
import MessageTools from './MessageTools.vue';
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue';
import { computed, shallowRef } from 'vue';
import { MessageId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import useElementRenderObserver, {
  ChangeHeightData
} from './composables/useElementRenderObserver'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import useHover from '/@/composables/useHover'
import { useMessagesStore } from '/@/store/entities/messages'

const props = withDefaults(defineProps<{
    messageId: MessageId,
    isEntryMessage?: boolean
}>(), {
    isEntryMessage: false
});

const emit = defineEmits<{
    (e: "entryMessageLoaded", _relativePos: number): void,
    (e: "changeHeight", _data: ChangeHeightData): void
}>();

const { messagesMap } = useMessagesStore()

const bodyRef = shallowRef<HTMLDivElement | null>(null)
const { isMobile } = useResponsiveStore()
const message = computed(() => messagesMap.value.get(props.messageId))

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
  &[data-is-entry] {
    // TODO: 色を正しくする
    background: $common-background-pin;
  }
  &:not([data-is-entry]):hover {
    // TODO: 色を正しくする
    @include background-secondary;
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
