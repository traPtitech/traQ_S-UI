<template>
  <div
    :class="$style.container"
    :data-is-selected="$boolAttr(isSelected)"
    :data-is-inactive="$boolAttr(!channelOrClipFolder.active)"
  >
    <!-- チャンネル表示本体 -->
    <div :class="$style.channelContainer">
      <div
        @click.stop="onClickIcon"
        @mouseenter="onIconHovered"
        @mouseleave="onIconHoveredLeave"
      >
        <ChannelElementIcon
          v-if="!isClip"
          :class="$style.channelIcon"
          :has-child="hasChildren"
          :is-selected="isSelected"
          :is-opened="isOpened"
          :has-notification="notificationState.hasNotification"
          :has-notification-on-child="notificationState.hasNotificationOnChild"
          :is-inactive="!channelOrClipFolder.active"
          :icon-name="iconName"
        />
        <AIcon
          v-else
          name="bookmark"
          mdi
          :class="$style.icon"
          :data-is-selected="$boolAttr(isSelected)"
        />
      </div>
      <router-link v-slot="{ href, navigate }" custom :to="itemLink">
        <a
          :class="$style.channel"
          :href="href"
          :aria-current="isSelected && 'page'"
          :aria-expanded="hasChildren && isOpened ? true : undefined"
          :data-is-inactive="$boolAttr(!channelOrClipFolder.active)"
          :aria-label="
            showShortenedPath ? pathTooltip : (pathToShow ?? undefined)
          "
          draggable="false"
          @click="navigate"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @focus="onFocus"
          @blur="onBlur"
        >
          <ChannelElementName
            :channel-or-clip-folder="channelOrClipFolder"
            :show-shortened-path="showShortenedPath"
            :is-selected="isSelected"
          />
          <ChannelElementUnreadBadge
            v-if="!isClip"
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
import { ChannelSubscribeLevel } from '@traptitech/traq'

import { computed, toRef } from 'vue'

import {
  type TypedProps,
  usePath
} from '/@/components/Main/NavigationBar/ChannelList/composables/usePath'
import AIcon from '/@/components/UI/AIcon.vue'
import useFocus from '/@/composables/dom/useFocus'
import useHover from '/@/composables/dom/useHover'
import useChannelPath from '/@/composables/useChannelPath'
import { useOpenLink } from '/@/composables/useOpenLink'
import { type TreeNode, isClipFolderNode } from '/@/lib/channelTree'
import { LEFT_CLICK_BUTTON } from '/@/lib/dom/event'
import { constructClipFoldersPath } from '/@/router'
import { useMainViewStore } from '/@/store/ui/mainView'
import type { ChannelId } from '/@/types/entity-ids'

import useNotificationState from '../composables/useNotificationState'
import ChannelElementIcon from './ChannelElementIcon.vue'
import ChannelElementName from './ChannelElementName.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'

const props = withDefaults(
  defineProps<{
    channelOrClipFolder: TreeNode
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

const isClip = computed(() => isClipFolderNode(props.channelOrClipFolder))

const hasChildren = computed(() =>
  isClip.value ? false : props.channelOrClipFolder.children.length > 0
)

const isSelected = computed(() => {
  if (isClip.value) {
    return (
      primaryView.value.type === 'clips' &&
      props.channelOrClipFolder.id === primaryView.value.clipFolderId
    )
  }
  return (
    primaryView.value.type === 'channel' &&
    props.channelOrClipFolder.id === primaryView.value.channelId
  )
})

const onClickIcon = (e: KeyboardEvent | MouseEvent) => {
  if (isClip.value) {
    // クリップフォルダの場合は常にページ遷移
    if (e instanceof MouseEvent && e.button === LEFT_CLICK_BUTTON) {
      openItem(e)
    }
    return
  }

  if (
    e instanceof MouseEvent &&
    (!hasChildren.value || e.button !== LEFT_CLICK_BUTTON)
  ) {
    openItem(e)
    return
  }
  emit('clickHash', props.channelOrClipFolder.id)
}

const { openLink } = useOpenLink()
const { channelIdToLink } = useChannelPath()

const itemLink = computed(() => {
  if (isClip.value) {
    return constructClipFoldersPath(props.channelOrClipFolder.id)
  }
  return channelIdToLink(props.channelOrClipFolder.id) ?? ''
})

const openItem = (event: MouseEvent) => {
  openLink(event, itemLink.value)
}

const { pathToShow, pathTooltip } = usePath(props as TypedProps)

const notificationState = computed(() => {
  if (isClip.value) {
    return {
      hasNotification: false,
      hasNotificationOnChild: false,
      isNoticeable: false,
      unreadCount: 0,
      subscriptionLevel: undefined,
      isStarred: false
    }
  }
  return useNotificationState(toRef(props, 'channelOrClipFolder'))
})

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
const { isFocused, onFocus, onBlur } = useFocus()
const {
  isHovered: isIconHovered,
  onMouseEnter: onIconMouseEnter,
  onMouseLeave: onIconMouseLeave
} = useHover()
const onIconHovered = () => {
  onIconMouseEnter()
  onMouseEnter()
}
const onIconHoveredLeave = () => {
  onIconMouseLeave()
  onMouseLeave()
}
const isChannelBgHovered = computed(
  () => isHovered.value && !(hasChildren.value && isIconHovered.value)
)

const iconName = computed(() => {
  if (
    props.showNotified &&
    notificationState.value.subscriptionLevel === ChannelSubscribeLevel.notified
  ) {
    return 'notified'
  }
  if (props.showStar && notificationState.value.isStarred) {
    return 'star-outline'
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
.channelIcon {
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
.icon {
  cursor: pointer;
  position: absolute;
  left: 0;
  flex-shrink: 0;
  margin: 4px;
  &[data-is-selected] {
    @include color-accent-primary;
    &:hover::before,
    .container:focus &::before {
      @include background-accent-primary;
    }
  }
}
.slot {
  padding-left: $bgLeftShift;
}
</style>
