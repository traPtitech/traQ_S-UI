<template>
  <div
    :class="$style.container"
    :aria-selected="isSelected"
    :data-is-inactive="$boolAttr(!channel.active)"
  >
    <!-- チャンネル表示本体 -->
    <div
      :class="$style.channel"
      @mousedown="openChannel"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <channel-element-hash
        :class="$style.channelHash"
        :has-child="hasChildren"
        :is-selected="isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="!channel.active"
        @mousedown.stop="onChannelHashClick"
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
    </div>

    <div :class="$style.slot">
      <slot />
    </div>

    <!-- チャンネルの背景 -->
    <div
      v-if="isSelected || isChannelBgHovered"
      :class="$style.selectedBg"
      :data-is-hovered="$boolAttr(isChannelBgHovered)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { ChannelTreeNode } from '/@/lib/channelTree'
import { ChannelId } from '/@/types/entity-ids'
import useHover from '/@/composables/useHover'
import { LEFT_CLICK_BUTTON } from '/@/lib/dom/event'
import { useMainViewStore } from '/@/store/ui/mainView'
import ChannelElementHash from './ChannelElementHash.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'
import ChannelElementName from './ChannelElementName.vue'
import useNotificationState from '../composables/useNotificationState'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'

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

const notificationState = useNotificationState(toRef(props, 'channel'))

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
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
.slot {
  padding-left: $bgLeftShift;
}
</style>
