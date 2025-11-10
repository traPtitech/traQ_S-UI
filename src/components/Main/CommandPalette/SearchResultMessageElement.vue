<template>
  <div
    :class="$style.container"
    :data-oversized="$boolAttr(oversized)"
    :data-expanded="$boolAttr(expanded)"
    @click="onClick"
  >
    <UserIcon :class="$style.icon" :size="32" :user-id="message.userId" />
    <div :class="$style.header" @click.stop="">
      <span :class="$style.displayName">{{
        user?.displayName ?? 'Unknown'
      }}</span>
      <span :class="$style.userName">@{{ user?.name ?? 'unknown' }}</span>
    </div>
    <div :class="$style.contentContainer">
      <div :class="$style.markdownWrapper">
        <div ref="contentRef" :class="$style.markdownContainer">
          <MarkdownContent
            :content="renderedContent"
            @click="toggleSpoilerHandler"
          />
          <MessageQuoteList
            v-if="quotedMessageIds.length > 0"
            :class="$style.quoteList"
            :parent-message-channel-id="message.channelId"
            :message-ids="quotedMessageIds"
            disable-item-footer-links
          />
        </div>
        <div
          v-if="oversized && !expanded"
          :class="$style.expandButton"
          @mousedown.stop="toggleExpanded"
        >
          <AIcon name="arrow-expand-vertical" mdi :size="20" />全て表示
        </div>
      </div>
      <MessageFileSummary
        v-if="fileIds.length > 0"
        :file-ids="fileIds"
        :class="$style.fileList"
      />
    </div>
    <MessageQuoteListItemFooter
      :class="$style.footer"
      :message="message"
      :date="date"
      disable-links
    />
  </div>
</template>

<script lang="ts" setup>
import type { Message } from '@traptitech/traq'
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'

import type { DeepReadonly } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'

import MessageQuoteList from '/@/components/Main/MainView/MessageElement/Embeddings/MessageQuoteList.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useBoxSize from '/@/composables/dom/useBoxSize'
import useSpoilerToggler from '/@/composables/markdown/useSpoilerToggler'
import useToggle from '/@/composables/utils/useToggle'
import { isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { useMessagesStore } from '/@/store/entities/messages'
import { useUsersStore } from '/@/store/entities/users'
import type { MessageId } from '/@/types/entity-ids'

import MessageFileSummary from '../MainView/MessageElement/Embeddings/MessageFileSummary.vue'
import MessageQuoteListItemFooter from '../MainView/MessageElement/Embeddings/MessageQuoteListItemFooter.vue'

const props = defineProps<{
  message: DeepReadonly<Message>
  currentSortKey: SearchMessageSortKey
}>()

const emit = defineEmits<{
  (e: 'clickOpen', _event: MouseEvent, _messageId: MessageId): void
  (e: 'rendered'): void
}>()

const { usersMap, fetchUser } = useUsersStore()

// 検索によって出てきたメッセージなので、ユーザーが取得できていない場合がある
fetchUser({ userId: props.message.userId })

const user = computed(() => usersMap.value.get(props.message.userId))

const date = computed(() => {
  if (
    props.currentSortKey === 'createdAt' ||
    props.currentSortKey === '-createdAt'
  ) {
    return new Date(props.message.createdAt)
  }

  return new Date(props.message.updatedAt)
})
const { fetchFileMetaData } = useMessagesStore()

const renderedResult = ref<MarkdownRenderResult>()
watchEffect(async () => {
  renderedResult.value = await render(props.message.content)
  const filePromises = renderedResult.value.embeddings.filter(isFile).map(e =>
    fetchFileMetaData({
      fileId: e.id
    })
  )
  // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
  await Promise.allSettled(filePromises)
  // renderedを発火したあとにレイアウトシフトなどがおこると
  // スクロール位置のリストアが壊れるので注意すること
  emit('rendered')
})
const renderedContent = computed(() => renderedResult.value?.renderedText ?? '')
const fileIds = computed(
  () =>
    renderedResult.value?.embeddings.filter(isFile).map(({ id }) => id) ?? []
)
const quotedMessageIds = computed(
  () =>
    renderedResult.value?.embeddings.filter(isMessage).map(({ id }) => id) ?? []
)

const onClick = (e: MouseEvent) => {
  emit('clickOpen', e, props.message.id)
}

const maxHeight = 200

const contentRef = shallowRef<HTMLElement | null>(null)
const { height } = useBoxSize(contentRef)
const oversized = computed(
  () => height.value !== undefined && height.value >= maxHeight
)
const { value: expanded, toggle: toggleExpanded } = useToggle(false)

const { toggleSpoilerHandler } = useSpoilerToggler()
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-areas:
    'icon header'
    'icon content'
    'icon channelAndDate';
  grid-template-columns: 32px 1fr;
  gap: 4px 16px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover:has(.icon:not(:hover)):has(.header:not(:hover)) {
    @include background-secondary;
  }
}
.icon {
  grid-area: icon;
}
.header {
  grid-area: header;
  display: flex;
  align-items: baseline;
  min-width: 0;
}
.displayName {
  @include color-ui-primary;
  font-weight: bold;
  flex: 2;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.userName {
  @include color-ui-secondary;
  @include size-body2;
  margin-left: 4px;
  flex: 1;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

$message-max-height: 200px;
$expand-button-height: 32px;

.contentContainer {
  @include color-ui-primary;
  grid-area: content;
  min-width: 0;
}
.markdownWrapper {
  position: relative;
}
.markdownContainer {
  max-height: $message-max-height;
  overflow: hidden;
  overflow: clip;
  .container[data-expanded] & {
    // NOTE: 画面幅の変更でoversizedではなくてもexpandedがつくことがあるが、
    //       元の高さに戻すボタンは置かないためスタイル上でこの場合を考慮する必要はない
    max-height: unset;
  }
  .container[data-oversized]:not([data-expanded]) & {
    mask-image: linear-gradient(
      black,
      black calc(100% - $expand-button-height * 2),
      rgba(0, 0, 0, 0.1) calc(100% - $expand-button-height),
      transparent 100%
    );
  }
}
.quoteList {
  margin-block: 16px;
}
.expandButton {
  position: absolute;
  left: 0;
  bottom: 0;
  @include color-ui-secondary;
  @include size-body2;
  grid-area: expandButton;
  width: max-content;
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    @include background-tertiary;
  }
}
.fileList {
  margin-top: 0.5rem;
}
.footer {
  grid-area: channelAndDate;
}
</style>
