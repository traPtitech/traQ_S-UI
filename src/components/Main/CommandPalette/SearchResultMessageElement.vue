<template>
  <div
    :class="$style.container"
    :data-oversized="$boolAttr(oversized)"
    :data-expanded="$boolAttr(expanded)"
    @click="onClick"
  >
    <user-icon :class="$style.icon" :size="32" :user-id="message.userId" />
    <div :class="$style.header" @click.stop="">
      <span :class="$style.displayName">{{
        user?.displayName ?? 'Unknown'
      }}</span>
      <span :class="$style.userName">@{{ user?.name ?? 'unknown' }}</span>
    </div>
    <div :class="$style.contentContainer">
      <div :class="$style.markdownWrapper">
        <div ref="contentRef" :class="$style.markdownContainer">
          <markdown-content
            :content="renderedContent"
            @click="toggleSpoilerHandler"
          />
        </div>
        <div
          v-if="oversized && !expanded"
          :class="$style.expandButton"
          @mousedown.stop="toggleExpanded"
        >
          <a-icon name="arrow-expand-vertical" mdi :size="20" />全て表示
        </div>
      </div>
      <search-result-message-file-list
        v-if="fileIds.length > 0"
        :file-ids="fileIds"
        :class="$style.fileList"
      />
    </div>
    <div :class="$style.channelAndDate">
      <span :class="$style.channelName">{{ channelName }}</span> -
      <time>{{ date }}</time>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DeepReadonly } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import { getCreatedDate } from '/@/lib/basic/date'
import type { MessageId } from '/@/types/entity-ids'
import useChannelPath from '/@/composables/useChannelPath'
import type { Message } from '@traptitech/traq'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { useUsersStore } from '/@/store/entities/users'
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { render } from '/@/lib/markdown/markdown'
import { isFile } from '/@/lib/guard/embeddingOrUrl'
import AIcon from '/@/components/UI/AIcon.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import SearchResultMessageFileList from './SearchResultMessageFileList.vue'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import useToggle from '/@/composables/utils/useToggle'
import useSpoilerToggler from '/@/composables/markdown/useSpoilerToggler'
import useBoxSize from '/@/composables/dom/useBoxSize'
import { useMessagesStore } from '/@/store/entities/messages'

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

const { channelIdToPathString } = useChannelPath()
const user = computed(() => usersMap.value.get(props.message.userId))
const channelName = computed(() =>
  channelIdToPathString(props.message.channelId, true)
)
const date = computed(() => {
  let _date: string
  if (
    props.currentSortKey === 'createdAt' ||
    props.currentSortKey === '-createdAt'
  ) {
    _date = props.message.createdAt
  } else {
    _date = props.message.updatedAt
  }
  return getCreatedDate(_date)
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
    renderedResult.value?.embeddings.filter(isFile).map(file => file.id) ?? []
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
.channelAndDate {
  @include color-ui-secondary;
  @include size-body2;
  grid-area: channelAndDate;
}
.channelName {
  word-break: break-all;
}
</style>
