<template>
  <div
    :class="$style.container"
    :data-is-selected="$boolAttr(isSelected)"
    :data-is-inactive="$boolAttr(!channel.active)"
  >
    <!-- チャンネル表示本体 -->
    <div :class="$style.channelContainer">
      <channel-element-icon
        :class="$style.channelHash"
        :has-child="hasChildren"
        :is-selected="isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="!channel.active"
        :icon-name="iconName"
        @mousedown.stop="onChannelHashClick"
        @keydown.enter="onChannelHashKeydownEnter"
        @mouseenter="onHashHovered"
        @mouseleave="onHashHoveredLeave"
      />
      <router-link
        v-slot="{ href, navigate }"
        custom
        :to="channelIdToLink(props.channel.id)"
      >
        <a
          :class="$style.channel"
          :href="href"
          :aria-current="isSelected && 'page'"
          :aria-expanded="hasChildren && isOpened ? true : undefined"
          :data-is-inactive="$boolAttr(!channel.active)"
          :aria-label="showShortenedPath ? pathTooltip : pathToShow"
          draggable="false"
          @click="navigate"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @focus="onFocus"
          @blur="onBlur"
        >
          <channel-element-name
            :channel="channel"
            :show-shortened-path="showShortenedPath"
            :is-selected="isSelected"
          />
          <channel-element-unread-badge
            :is-noticeable="notificationState.isNoticeable"
            :unread-count="notificationState.unreadCount"
          />
        </a>
      </router-link>
    </div>

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
import ChannelElementIcon from './ChannelElementIcon.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'
import ChannelElementName from './ChannelElementName.vue'
import useNotificationState from '../composables/useNotificationState'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'
import useFocus from '/@/composables/dom/useFocus'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import {
  usePath,
  type TypedProps
} from '/@/components/Main/NavigationBar/ChannelList/composables/usePath'

const props = withDefaults(
  defineProps<{
    channel: ChannelTreeNode
    isOpened?: boolean
    showShortenedPath?: boolean
    showStar?: boolean
    showNotified?: boolean
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

const onChannelHashKeydownEnter = () => {
  if (hasChildren.value) {
    emit('clickHash', props.channel.id)
  }
}
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
const onHashHovered = () => {
  onHashMouseEnter()
  onMouseEnter()
}
const onHashHoveredLeave = () => {
  onHashMouseLeave()
  onMouseLeave()
}
const isChannelBgHovered = computed(
  () => isHovered.value && !(hasChildren.value && isHashHovered.value)
)

const iconName = computed(() => {
  if (props.showStar && notificationState.isStarred) {
    return 'star-outline'
  }
  if (
    props.showNotified &&
    notificationState.subscriptionLevel === ChannelSubscribeLevel.notified
  ) {
    return 'notified'
  }
  return 'hash'
})
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
.channelContainer {
  position: relative;
  display: flex;
  height: $elementHeight;
  padding-left: 24px;
  padding-right: 4px;
  margin-left: $bgLeftShift;
  z-index: 0;
  &[data-is-inactive] {
    @include color-ui-secondary;
  }
  &[aria-current='page'] {
    @include color-accent-primary;
  }
}
.channel {
  display: flex;
  align-items: center;
  margin-left: $bgLeftShift;
  width: calc(100% - $bgLeftShift);
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
  position: absolute;
  left: 0;
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
