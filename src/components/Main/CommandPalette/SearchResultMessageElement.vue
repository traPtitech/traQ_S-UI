<template>
  <div
    :class="$style.container"
    :data-oversized="$boolAttr(oversized)"
    :data-expanded="$boolAttr(expanded)"
    @click="onClick"
  >
    <user-icon :class="$style.icon" :size="32" :user-id="message.userId" />
    <div :class="$style.userName">{{ userName }}</div>
    <div ref="contentRef" :class="$style.contentContainer">
      <message-markdown :message-id="message.id" />
    </div>
    <div
      :class="$style.expandButton"
      v-if="oversized && !expanded"
      @click.stop="onClickExpandButton"
    >
      <icon name="arrow-expand-vertical" mdi :size="20" />全て表示
    </div>
    <div :class="$style.channelAndDate">
      {{ channelName }} - <time :class="$style.date">{{ date }}</time>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  Ref
} from 'vue'
import Icon from '@/components/UI/Icon.vue'
import MessageMarkdown from '@/components/UI/MessageMarkdown.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import { getCreatedDate } from '@/lib/date'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import { Message } from '@traptitech/traq'

const maxHeight = 200

const useHeightObserver = (contentRef: Ref<HTMLElement | undefined>) => {
  const oversized = ref(false)
  const observer = new ResizeObserver(entries => {
    const entry = entries[0]
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

export default defineComponent({
  name: 'SearchResultMessageElement',
  components: {
    Icon,
    UserIcon,
    MessageMarkdown
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  emits: {
    clickOpen: (messageId: MessageId) => true
  },
  setup(props, { emit }) {
    // 検索によって出てきたメッセージなので、ユーザーが取得できていない場合がある
    store.dispatch.entities.fetchUser({ userId: props.message.userId })

    const { channelIdToPathString } = useChannelPath()
    const userName = computed(
      () => store.state.entities.usersMap.get(props.message.userId)?.name ?? ''
    )
    const channelName = computed(() =>
      channelIdToPathString(props.message.channelId, true)
    )
    const date = computed(() => getCreatedDate(props.message.updatedAt))

    const onClick = () => emit('clickOpen', props.message.id)

    const contentRef = ref<HTMLElement>()
    const { oversized, expanded, onClickExpandButton } = useMessageExpansion(
      contentRef
    )

    return {
      userName,
      channelName,
      date,
      onClick,
      expanded,
      oversized,
      onClickExpandButton,
      contentRef
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-areas:
    'icon userName'
    'icon content'
    'icon channelAndDate';
  grid-template-columns: 32px 1fr;
  &[data-oversized]:not([data-expanded]) {
    grid-template-areas:
      'icon userName'
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
.userName {
  @include color-ui-primary;
  grid-area: userName;
  font-weight: bold;
}

$message-max-height: 200px;

.contentContainer {
  @include color-text-primary;
  grid-area: content;
  max-height: $message-max-height;
  overflow: hidden;
  .container[data-expanded] & {
    // NOTE: 画面幅の変更でoversizedではなくてもexpandedがつくことがあるが、
    //       元の高さに戻すボタンは置かないためスタイル上でこの場合を考慮する必要はない
    max-height: unset;
  }
  .container[data-oversized]:not([data-expanded]) & {
    mask-image: linear-gradient(black calc(100% - 32px), transparent 100%);
  }
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
