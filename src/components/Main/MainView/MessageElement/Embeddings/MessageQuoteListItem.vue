<template>
  <div v-if="shouldShow" :class="$style.body" data-is-shown>
    <UserIcon
      :class="$style.userIcon"
      :user-id="message!.userId"
      :size="24"
      prevent-modal
    />
    <MessageQuoteListItemHeader
      :class="$style.messageHeader"
      :user-id="message!.userId"
    />
    <div :class="$style.messageContents">
      <div
        :id="markdownId"
        ref="contentRef"
        :class="[$style.markdownContainer, oversized && $style.oversized]"
        :data-expanded="!isFold"
      >
        <MarkdownContent :content="content" />
        <div
          v-if="embeddingsState.quoteMessageIds.length > 0"
          :class="[$style.body, $style.quote]"
        >
          引用メッセージ
        </div>
        <MessageFileSummary
          v-if="embeddingsState.fileIds.length > 0"
          :file-ids="embeddingsState.fileIds"
          :class="$style.fileList"
        />
      </div>
      <FoldButton
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
    <MessageQuoteListItemFooter
      :class="$style.footer"
      :message="message!"
      :disable-links="disableFooterLinks"
    />
  </div>
  <div v-else :class="$style.body">
    存在しないか表示できないメッセージの引用です
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watchEffect } from 'vue'

import FoldButton from '/@/components/UI/FoldButton.vue'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useBoxSize from '/@/composables/dom/useBoxSize'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import useToggle from '/@/composables/utils/useToggle'
import { randomString } from '/@/lib/basic/randomString'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useChannelsStore } from '/@/store/entities/channels'
import { useMessagesStore } from '/@/store/entities/messages'
import type { ChannelId, DMChannelId, MessageId } from '/@/types/entity-ids'

import { useMessageReady } from '../composables/useMessageReady'
import MessageFileSummary from './MessageFileSummary.vue'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'
import MessageQuoteListItemHeader from './MessageQuoteListItemHeader.vue'

const props = defineProps<{
  parentMessageChannelId: ChannelId | DMChannelId
  messageId: MessageId
  disableFooterLinks: boolean
}>()

const { renderedContentMap, renderMessageContent } = useMessagesView()
const { messagesMap, fetchFileMetaData } = useMessagesStore()
const { dmChannelsMap } = useChannelsStore()
const { embeddingsState } = useEmbeddings(props)

const { register } = useMessageReady()
if (register) {
  register(
    (async () => {
      await renderMessageContent(props.messageId)
      await Promise.all(
        embeddingsState.fileIds.map(fileId => fetchFileMetaData({ fileId }))
      )
    })()
  )
}

onBeforeMount(() => renderMessageContent(props.messageId))

watchEffect(async () => {
  await Promise.allSettled(
    embeddingsState.fileIds.map(fileId => fetchFileMetaData({ fileId }))
  )
})

const message = computed(() => messagesMap.value.get(props.messageId))
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
const { value: isFold, toggle: toggleFoldImpl } = useToggle(true)

const toggleFold = (e: MouseEvent) => {
  e.stopPropagation()
  toggleFoldImpl()
}
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

.fileList {
  margin-block: 8px;
}

.quote {
  margin-block: 8px;
}

.footer {
  grid-area: footer;
  margin-top: 4px;
  padding-left: 8px;
}
</style>
