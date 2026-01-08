<template>
  <ClickOutside :enabled="showMessageTools" @click-outside="onClickOutside">
    <div
      v-if="message"
      ref="bodyRef"
      :class="$style.body"
      :data-is-mobile="$boolAttr(isMobile)"
      :data-is-pinned="$boolAttr(message.pinned)"
      :data-is-entry="$boolAttr(isEntryMessage)"
      :data-is-editing="$boolAttr(isEditing)"
      :data-is-active="$boolAttr(isActive)"
      @pointerenter="onPointerEnter"
      @click="onClick"
      @mouseleave="onMouseLeave"
    >
      <MessagePinned
        v-if="pinnedUserId"
        :pinned-user-id="pinnedUserId"
        :class="$style.pinned"
      />
      <MessageTools
        v-model:is-active="isActive"
        :show="showMessageTools"
        :class="$style.tools"
        :message-id="messageId"
        :is-minimum="isArchived"
      />
      <MessageContents
        :class="$style.messageContents"
        :message-id="messageId"
      />
      <MessageStampList
        :show-detail-button="isHovered || isMobile"
        :message-id="messageId"
        :stamps="message.stamps"
        :is-archived="isArchived"
      />
    </div>
  </ClickOutside>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  toRef,
  watch
} from 'vue'

import MessageTools, {
  useMessageToolsHover
} from '/@/components/Main/MainView/MessageElement/MessageTools.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import useResponsive from '/@/composables/useResponsive'
import { useMessagesStore } from '/@/store/entities/messages'
import { useMessageEditingStateStore } from '/@/store/ui/messageEditingStateStore'
import type { MessageId, UserId } from '/@/types/entity-ids'

import MessageContents from './MessageContents.vue'
import MessagePinned from './MessagePinned.vue'
import MessageStampList from './MessageStampList.vue'
import useElementRenderObserver, {
  type ChangeHeightData
} from './composables/useElementRenderObserver'
import { provideMessageReady } from './composables/useMessageReady'

const props = withDefaults(
  defineProps<{
    messageId: MessageId
    pinnedUserId?: UserId
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
  (e: 'messageReady', _messageId: MessageId): void
}>()

const isActive = ref(false)
const bodyRef = shallowRef<HTMLDivElement | null>(null)
const { waitAll } = provideMessageReady()

onMounted(async () => {
  await new Promise<void>(resolve => {
    if (bodyRef.value) return resolve()
    const stop = watch(bodyRef, val => {
      if (val) {
        stop()
        resolve()
      }
    })
  })

  await waitAll()
  await nextTick()

  emit('messageReady', props.messageId)
})

const { isMobile } = useResponsive()
const { messagesMap } = useMessagesStore()
const message = computed(() => messagesMap.value.get(props.messageId))

const { editingMessageId } = useMessageEditingStateStore()
const isEditing = computed(() => props.messageId === editingMessageId.value)

const { embeddingsState } = useEmbeddings(props)

useElementRenderObserver(
  bodyRef,
  toRef(props, 'isEntryMessage'),
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
  &[data-is-pinned] {
    background: $common-background-pin;
  }
  &[data-is-entry] {
    // TODO: 色を正しくする
    background: $common-background-pin;
  }
  &:not([data-is-editing]):not([data-is-pinned]):not([data-is-entry]) {
    &[data-is-active],
    &:hover {
      background: var(--specific-message-hover-background);
    }
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
