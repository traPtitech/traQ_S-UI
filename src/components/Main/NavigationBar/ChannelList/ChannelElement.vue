<template>
  <div
    :class="$style.container"
    :aria-selected="state.isSelected"
    :data-is-inactive="$boolAttr(state.isInactive)"
  >
    <!-- チャンネル表示本体 -->
    <div
      :class="$style.channel"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <channel-element-hash
        :class="$style.channelHash"
        :has-child="!ignoreChildren && state.hasChild"
        :is-selected="state.isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="state.isInactive"
        @mousedown="onChannelHashClick"
        @mouseenter="onHashMouseEnter"
        @mouseleave="onHashMouseLeave"
      />
      <channel-element-name
        :channel="channel"
        :show-shortened-path="showShortenedPath"
        :is-selected="state.isSelected"
        @mousedown="onChannelNameClick"
      />
      <channel-element-unread-badge
        :is-noticeable="notificationState.isNoticeable"
        :unread-count="notificationState.unreadCount"
        @mousedown="onChannelNameClick"
      />
    </div>
    <channel-element-topic
      v-if="showTopic"
      :class="$style.topic"
      :channel-id="channel.id"
      @mousedown="onChannelNameClick"
    />

    <!-- 子チャンネル表示 -->
    <channel-list
      :is-shown="!ignoreChildren && isOpened"
      :class="$style.children"
      :channels="state.children"
    />

    <!-- チャンネルの背景 -->
    <div
      v-if="state.isSelected || isChannelBgHovered"
      :class="$style.selectedBg"
      :data-is-hovered="$boolAttr(isChannelBgHovered)"
    />
  </div>
</template>

<script lang="ts">
import { computed, reactive, Ref, defineAsyncComponent } from 'vue'
import { ChannelTreeNode } from '/@/lib/channelTree'
import { ChannelId } from '/@/types/entity-ids'
import { deepSome } from '/@/lib/basic/tree'
import { Channel } from '@traptitech/traq'
import useHover from '/@/composables/useHover'
import { LEFT_CLICK_BUTTON } from '/@/lib/dom/event'
import { useMeStore } from '/@/store/domain/me'
import { useMainViewStore } from '/@/store/ui/mainView'

const useChannelClick = (
  emit: ((event: 'channelFoldingToggle', _channelId: string) => void) &
    ((event: 'channelSelect', _event: MouseEvent, _channelId: string) => void),
  id: ChannelId,
  isChildShown: Ref<boolean>
) => {
  const onChannelNameClick = (e: MouseEvent) => emit('channelSelect', e, id)
  const onChannelHashClick = (e: MouseEvent) => {
    if (isChildShown.value && e.button === LEFT_CLICK_BUTTON) {
      emit('channelFoldingToggle', id)
    } else {
      emit('channelSelect', e, id)
    }
  }
  return {
    onChannelHashClick,
    onChannelNameClick
  }
}

const useNotification = (props: TypedProps) => {
  const { unreadChannelsMap } = useMeStore()
  const unreadChannel = computed(() =>
    unreadChannelsMap.value.get(props.channel.id)
  )

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() =>
      props.ignoreChildren
        ? false
        : deepSome(props.channel, channel =>
            unreadChannelsMap.value.has(channel.id)
          )
    ),
    unreadCount: computed(() => unreadChannel.value?.count),
    isNoticeable: computed(() => unreadChannel.value?.noticeable)
  })
  return notificationState
}

interface Props {
  channel: ChannelTreeNode | Channel
  isOpened: boolean
  ignoreChildren: boolean
  showShortenedPath: boolean
  showTopic: boolean
}

interface WithChildrenProps extends Props {
  channel: ChannelTreeNode
  showShortenedPath: false
  ignoreChildren: false
}

interface IgnoreChildrenProps extends Props {
  channel: Channel
  showShortenedPath: true
  ignoreChildren: true
}

type TypedProps = WithChildrenProps | IgnoreChildrenProps

// 型エラー・コンポーネント循環参照の回避
const ChannelList = defineAsyncComponent(() => import('./ChannelList.vue'))
</script>

<script lang="ts" setup>
import ChannelElementHash from './ChannelElementHash.vue'
import ChannelElementTopic from './ChannelElementTopic.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'
import ChannelElementName from './ChannelElementName.vue'

const props = withDefaults(
  defineProps<{
    channel: ChannelTreeNode | Channel
    isOpened?: boolean
    ignoreChildren?: boolean
    showShortenedPath?: boolean
    showTopic?: boolean
  }>(),
  {
    isOpened: false,
    ignoreChildren: false,
    showShortenedPath: false,
    showTopic: false
  }
)

const emit = defineEmits<{
  (e: 'channelFoldingToggle', _channelId: ChannelId): void
  (e: 'channelSelect', _event: MouseEvent, _channelId: ChannelId): void
}>()

const typedProps = props as TypedProps

const { primaryView } = useMainViewStore()

const state = reactive({
  children: computed(() =>
    typedProps.ignoreChildren
      ? []
      : typedProps.channel.children.filter(ch => !ch.archived)
  ),
  hasChild: computed((): boolean => state.children.length > 0),
  isInactive: computed(
    () => !typedProps.ignoreChildren && !typedProps.channel.active
  ),
  isSelected: computed(
    () =>
      primaryView.value.type === 'channel' &&
      typedProps.channel.id === primaryView.value.channelId
  )
})
const isChildShown = computed(() => !props.ignoreChildren && state.hasChild)

const { onChannelHashClick, onChannelNameClick } = useChannelClick(
  emit,
  typedProps.channel.id,
  isChildShown
)
const notificationState = useNotification(typedProps)

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
const {
  isHovered: isHashHovered,
  onMouseEnter: onHashMouseEnter,
  onMouseLeave: onHashMouseLeave
} = useHover()
const isChannelBgHovered = computed(
  () => isHovered.value && !(state.hasChild && isHashHovered.value)
)
</script>

<style lang="scss" module>
$elementHeight: 32px;
$bgHeight: 36px;
$bgLeftShift: 8px;
$topicLeftPadding: 40px;

.container {
  @include color-ui-primary;
  display: block;
  user-select: none;
  position: relative;
  contain: layout;
  &[data-is-inactive] {
    @include color-ui-secondary;
  }
  &[aria-selected='true'] {
    @include color-accent-primary;
  }
}
.channel {
  display: flex;
  align-items: center;
  position: relative;
  height: $elementHeight;
  padding-right: 4px;
  margin-left: $bgLeftShift;
  z-index: 0;
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
}
.children {
  display: block;
  position: relative;
  z-index: 0;
  margin-left: 20px;
}
.selectedBg {
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -1 * math.div($bgHeight - $elementHeight, 2);
  left: 0;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 0.1;
  pointer-events: none;

  display: none;
  .container[aria-selected='true'] > & {
    @include background-accent-primary;
    display: block;
  }
  &[data-is-hovered] {
    display: block;
    background: $theme-ui-primary-background;
  }
}
.topic {
  padding: {
    left: $topicLeftPadding + $bgLeftShift;
    right: 8px;
  }
}
</style>
