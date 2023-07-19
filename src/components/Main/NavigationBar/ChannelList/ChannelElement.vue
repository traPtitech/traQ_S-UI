<template>
  <div
    :class="$style.container"
    :data-is-selected="$boolAttr(isSelected)"
    :data-is-inactive="$boolAttr(!channel.active)"
  >
    <!-- チャンネル表示本体 -->
    <button
      :class="$style.channel"
      :aria-current="isSelected && 'page'"
      :aria-expanded="hasChildren && isOpened ? true : undefined"
      :data-is-inactive="$boolAttr(!channel.active)"
      :aria-label="showShortenedPath ? pathTooltip : pathToShow"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="openChannel"
      @focus="onFocus"
      @blur="onBlur"
    >
      <channel-element-hash
        :class="$style.channelHash"
        :has-child="hasChildren"
        :is-selected="isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="!channel.active"
        @click.stop="onChannelHashClick"
        @mouseenter="onHashMouseEnter"
        @mouseleave="onHashMouseLeave"
      />
      <channel-element-name
        :channel="channel"
        :show-shortened-path="showShortenedPath"
        :is-selected="isSelected"
      />
      <channel-element-unread-badge
        :is-noticeable="notificationState.isNoticeable"
        :unread-count="notificationState.unreadCount"
      />
    </button>

    <div :class="$style.slot">
      <slot />
    </div>

    <!-- チャンネルの背景 -->
    <div
      v-if="isSelected || isChannelBgHovered || isFocused"
      :class="$style.selectedBg"
      :data-is-hovered="$boolAttr(isChannelBgHovered)"
      :data-is-focused="$boolAttr(isFocused)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'
import useHover from '/@/composables/dom/useHover'
import { LEFT_CLICK_BUTTON } from '/@/lib/dom/event'
import { useMainViewStore } from '/@/store/ui/mainView'
import ChannelElementHash from './ChannelElementHash.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'
import ChannelElementName from './ChannelElementName.vue'
import useNotificationState from '../composables/useNotificationState'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'
import useFocus from '/@/components/Main/MainView/MessageInput/composables/useFocus'
import {
  usePath,
  type TypedProps
} from '/@/components/Main/NavigationBar/ChannelList/composables/usePath'

const props = withDefaults(
  defineProps<{
    channel: ChannelTreeNode
    isOpened?: boolean
    showShortenedPath?: boolean
  }>(),
  {
    isOpened: false,
    showShortenedPath: false
  }
)

const emit = defineEmits<{
  (e: 'clickHash', channelId: ChannelId): void
}>()

const { primaryView } = useMainViewStore()

const hasChildren = computed(() => props.channel.children.length > 0)
const isSelected = computed(
  () =>
    primaryView.value.type === 'channel' &&
    props.channel.id === primaryView.value.channelId
)

const onChannelHashClick = (e: MouseEvent) => {
  if (hasChildren.value && e.button === LEFT_CLICK_BUTTON) {
    emit('clickHash', props.channel.id)
  } else {
    openChannel(e)
  }
}

const { openLink } = useOpenLink()
const { channelIdToLink } = useChannelPath()
const openChannel = (event: MouseEvent) => {
  openLink(event, channelIdToLink(props.channel.id))
}

const { pathToShow, pathTooltip } = usePath(props as TypedProps)

const notificationState = useNotificationState(toRef(props, 'channel'))

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
const { isFocused, onFocus, onBlur } = useFocus()
const {
  isHovered: isHashHovered,
  onMouseEnter: onHashMouseEnter,
  onMouseLeave: onHashMouseLeave
} = useHover()
const isChannelBgHovered = computed(
  () => isHovered.value && !(hasChildren.value && isHashHovered.value)
)
</script>

<style lang="scss" module>
$elementHeight: 32px;
$bgHeight: 36px;
$bgLeftShift: 8px;

.container {
  @include color-ui-primary;
  display: block;
  user-select: none;
  position: relative;
  contain: layout;
  &[data-is-inactive] {
    @include color-ui-secondary;
  }
  &[data-is-selected] {
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
  width: calc(100% - $bgLeftShift);
  &[data-is-inactive] {
    @include color-ui-secondary;
  }
  &[aria-current='page'] {
    @include color-accent-primary;
  }
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
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
  .container[data-is-selected] > & {
    @include background-accent-primary;
    display: block;
  }
  &[data-is-hovered],
  &[data-is-focused] {
    display: block;
    background: $theme-ui-primary-background;
  }
}
.slot {
  padding-left: $bgLeftShift;
}
</style>
