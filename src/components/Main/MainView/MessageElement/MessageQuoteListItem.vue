<template>
  <div v-if="shouldShow" :class="$style.body" data-is-shown>
    <user-icon
      :class="$style.userIcon"
      :user-id="message.userId"
      :size="24"
      prevent-modal
    />
    <message-quote-list-item-header
      :class="$style.messageHeader"
      :user-id="message.userId"
    />
    <div :class="$style.messageContents">
      <div
        :id="markdownId"
        ref="contentRef"
        :class="[$style.markdownContainer, oversized && $style.oversized]"
        :data-expanded="!isFold"
      >
        <markdown-content :content="content" />
      </div>
      <fold-button
        v-if="oversized"
        :is-fold="isFold"
        :class="$style.foldButton"
        :aria-expanded="!isFold"
        :aria-controls="markdownId"
        background="none"
        show-icon
        small
        @click="toggleFold"
      />
    </div>
    <message-quote-list-item-footer :class="$style.footer" :message="message" />
  </div>
  <div v-else :class="$style.body">
    存在しないか表示できないメッセージの引用です
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import MessageQuoteListItemHeader from './MessageQuoteListItemHeader.vue'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'
import { computed, ref } from 'vue'
import type { MessageId, ChannelId, DMChannelId } from '/@/types/entity-ids'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'
import { useChannelsStore } from '/@/store/entities/channels'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import useToggle from '/@/composables/utils/useToggle'
import FoldButton from '/@/components/UI/FoldButton.vue'
import { randomString } from '/@/lib/basic/randomString'
import useBoxSize from '/@/composables/dom/useBoxSize'

const props = defineProps<{
  parentMessageChannelId: ChannelId | DMChannelId
  messageId: MessageId
}>()

const { renderedContentMap } = useMessagesView()
const { messagesMap } = useMessagesStore()
const { dmChannelsMap } = useChannelsStore()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const message = computed(() => messagesMap.value.get(props.messageId)!)
const shouldShow = computed(
  () =>
    !!message.value &&
    // DMのメッセージは同じDMチャンネルから引用されてる場合だけ表示する
    (!dmChannelsMap.value.has(message.value.channelId) ||
      message.value.channelId === props.parentMessageChannelId)
)
const content = computed(
  () => renderedContentMap.value.get(props.messageId) ?? ''
)

const MAX_HEIGHT = 200

const contentRef = ref<HTMLDivElement | null>(null)
const { height } = useBoxSize(contentRef)
const oversized = computed(
  () => height.value !== undefined && height.value >= MAX_HEIGHT
)

const markdownId = randomString()
const { value: isFold, toggle: toggleFold } = useToggle(true)
</script>

<style lang="scss" module>
.body {
  width: 100%;
  min-width: 0;
  padding: {
    left: 16px;
  }
  border: {
    left-width: 4px;
    left-style: solid;
    color: $theme-ui-tertiary-default;
  }
  overflow: hidden;
  &[data-is-shown] {
    display: grid;
    grid-template-areas:
      'user-icon message-header'
      'user-icon message-contents'
      '......... message-contents'
      '......... footer';
    grid-template-rows: 24px 1fr 1fr auto;
    grid-template-columns: 24px 1fr;
  }
  &:not([data-is-shown]) {
    @include color-text-secondary;
  }
}

.userIcon {
  grid-area: user-icon;
  margin-top: 2px;
}

.messageHeader {
  grid-area: message-header;
  padding-left: 8px;
}

.messageContents {
  @include size-body2;
  grid-area: message-contents;
  padding-top: 4px;
  padding-left: 8px;
  min-width: 0;
  position: relative;

  pre {
    white-space: pre-wrap;
  }
}

$message-max-height: 200px;
$fold-button-height: 28px;
$mask-image: linear-gradient(
  black,
  black calc(100% - $fold-button-height * 2),
  rgba(0, 0, 0, 0.1) calc(100% - $fold-button-height),
  transparent 100%
);

.markdownContainer {
  &[data-expanded='false'] {
    max-height: $message-max-height;
    overflow: hidden;
    overflow: clip;
  }

  &.oversized {
    &[data-expanded='false'] {
      -webkit-mask-image: $mask-image;
      mask-image: $mask-image;
    }

    &[data-expanded='true'] {
      max-height: unset;
      padding-bottom: $fold-button-height;
    }
  }
}

.foldButton {
  @include color-text-primary;
  cursor: pointer;
  position: absolute;
  left: 8px;
  bottom: 0;

  @media (any-hover: hover) {
    &:hover {
      @include background-tertiary;
    }
  }
  &:focus-visible {
    @include background-tertiary;
  }
}

.footer {
  grid-area: footer;
  margin-top: 4px;
}
</style>
