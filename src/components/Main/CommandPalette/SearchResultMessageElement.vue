<template>
  <div
    :class="$style.container"
    :data-oversized="$boolAttr(oversized)"
    :data-expanded="$boolAttr(expanded)"
    @mousedown="onClick"
  >
    <user-icon :class="$style.icon" :size="32" :user-id="message.userId" />
    <div :class="$style.header">
      <span :class="$style.displayName">{{
        user?.displayName ?? 'Unknown'
      }}</span>
      <span :class="$style.userName">@{{ user?.name ?? 'unknown' }}</span>
    </div>
    <div :class="$style.contentContainer">
      <div ref="contentRef" :class="$style.markdownContainer">
        <message-markdown
          :message-id="message.id"
          @click="toggleSpoilerHandler"
        />
      </div>
      <search-result-message-file-list
        :v-if="embeddingsState.fileIds.length > 0"
        :file-ids="embeddingsState.fileIds"
        :class="$style.fileList"
      />
    </div>
    <div
      v-if="oversized && !expanded"
      :class="$style.expandButton"
      @mousedown.stop="onClickExpandButton"
    >
      <icon name="arrow-expand-vertical" mdi :size="20" />全て表示
    </div>
    <div :class="$style.channelAndDate">
      {{ channelName }} - <time>{{ date }}</time>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  DeepReadonly,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  Ref
} from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import MessageMarkdown from '/@/components/UI/MessageMarkdown.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { getCreatedDate } from '/@/lib/basic/date'
import store from '/@/store'
import { MessageId } from '/@/types/entity-ids'
import useChannelPath from '/@/use/channelPath'
import useEmbeddings from '/@/use/message/embeddings'
import { Message } from '@traptitech/traq'
import SearchResultMessageFileList from './SearchResultMessageFileList.vue'
import { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'

const maxHeight = 200

const useHeightObserver = (contentRef: Ref<HTMLElement | undefined>) => {
  const oversized = ref(false)
  const observer = new ResizeObserver(entries => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entries[0]!
    const { height } = entry.target.getBoundingClientRect()
    oversized.value = height >= maxHeight
  })
  onMounted(() => {
    if (contentRef.value) observer.observe(contentRef.value)
  })
  onBeforeUnmount(() => {
    if (contentRef.value) observer.unobserve(contentRef.value)
  })

  return { oversized }
}

const useMessageExpansion = (contentRef: Ref<HTMLElement | undefined>) => {
  const { oversized } = useHeightObserver(contentRef)
  const expanded = ref(false)
  const onClickExpandButton = () => {
    expanded.value = !expanded.value
  }
  return { oversized, expanded, onClickExpandButton }
}

const useSpoilerToggler = () => {
  const toggleSpoilerHandler = (event: MouseEvent) => {
    if (!event.target) return
    const toggled = toggleSpoiler(event.target as HTMLElement)
    if (toggled) {
      event.stopPropagation()
    }
  }

  return { toggleSpoilerHandler }
}

export default defineComponent({
  name: 'SearchResultMessageElement',
  components: {
    Icon,
    UserIcon,
    MessageMarkdown,
    SearchResultMessageFileList
  },
  props: {
    message: {
      type: Object as PropType<DeepReadonly<Message>>,
      required: true
    },
    currentSortKey: {
      type: String as PropType<SearchMessageSortKey>,
      required: true
    }
  },
  emits: {
    clickOpen: (_event: MouseEvent, _messageId: MessageId) => true
  },
  setup(props, { emit }) {
    // 検索によって出てきたメッセージなので、ユーザーが取得できていない場合がある
    store.dispatch.entities.fetchUser({ userId: props.message.userId })

    const { channelIdToPathString } = useChannelPath()
    const user = computed(() =>
      store.state.entities.usersMap.get(props.message.userId)
    )
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

    const { embeddingsState } = useEmbeddings({ messageId: props.message.id })

    const onClick = (e: MouseEvent) => {
      emit('clickOpen', e, props.message.id)
    }

    const contentRef = ref<HTMLElement>()
    const { oversized, expanded, onClickExpandButton } =
      useMessageExpansion(contentRef)

    const { toggleSpoilerHandler } = useSpoilerToggler()

    return {
      user,
      channelName,
      date,
      embeddingsState,
      onClick,
      expanded,
      oversized,
      onClickExpandButton,
      contentRef,
      toggleSpoilerHandler
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-areas:
    'icon header'
    'icon content'
    'icon channelAndDate';
  grid-template-columns: 32px 1fr;
  &[data-oversized]:not([data-expanded]) {
    grid-template-areas:
      'icon header'
      'icon content'
      'icon expandButton'
      'icon channelAndDate';
  }
  gap: 4px 16px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
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

.contentContainer {
  @include color-ui-primary;
  grid-area: content;
  min-width: 0;
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
    mask-image: linear-gradient(black calc(100% - 32px), transparent 100%);
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
.expandButton {
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
</style>
