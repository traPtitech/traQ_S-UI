<template>
  <div :class="$style.container">
    <slot v-if="!isMobile" name="leading" />
    <HeaderToolsItem
      hover-scale
      :animation="notification.state === 'notified' ? 'shake' : undefined"
      :data-state="notification.state"
      :icon-name="notification.iconName"
      :tooltip="notification.tooltip"
      :disabled="notification.disabled"
      :aria-label="notification.tooltip"
      :aria-disabled="notification.disabled || undefined"
      role="button"
      :tabindex="notification.disabled ? -1 : 0"
      @click="onClickNotification"
      @keydown.enter="onClickNotification"
      @keydown.space.prevent="onClickNotification"
    />
    <HeaderToolsItem
      v-if="!isMobile && isStarred !== undefined"
      hover-scale
      :animation="isStarred ? 'spinAndPress' : undefined"
      :data-is-starred="$boolAttr(isStarred)"
      :icon-name="isStarred ? 'star' : 'star-outline'"
      :tooltip="starTooltip"
      :aria-label="starTooltip"
      :aria-pressed="isStarred"
      role="button"
      tabindex="0"
      @click="emit('clickStar')"
      @keydown.enter="emit('clickStar')"
      @keydown.space.prevent="emit('clickStar')"
    />
    <div :class="$style.moreButton">
      <ClickOutside
        v-if="isPopupMenuShown && slots.menu"
        @click-outside="closePopupMenu"
      >
        <div :class="$style.toolsMenu">
          <slot name="menu" :close="closePopupMenu" />
        </div>
      </ClickOutside>
      <HeaderToolsItem
        hover-scale
        icon-mdi
        icon-name="dots-horizontal"
        tooltip="その他"
        aria-label="その他"
        :aria-haspopup="slots.menu ? 'menu' : undefined"
        :aria-expanded="slots.menu ? isPopupMenuShown : undefined"
        role="button"
        tabindex="0"
        @click="onClickMore"
        @keydown.enter="onClickMore"
        @keydown.space.prevent="onClickMore"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import ClickOutside from '/@/components/UI/ClickOutside'
import useResponsive from '/@/composables/useResponsive'
import useToggle from '/@/composables/utils/useToggle'

import HeaderToolsItem from './PrimaryViewHeaderToolsItem.vue'

const props = withDefaults(
  defineProps<{
    notification: {
      state?: string
      iconName: string
      tooltip: string
      disabled?: boolean
    }
    /** お気に入りに対応する場合のみ指定する */
    isStarred?: boolean
  }>(),
  {
    isStarred: undefined
  }
)

const emit = defineEmits<{
  (e: 'clickNotification'): void
  (e: 'clickStar'): void
  (e: 'clickMore'): void
}>()

const slots = defineSlots<{
  leading?: () => unknown
  menu?: (props: { close: () => void }) => unknown
}>()

const { isMobile } = useResponsive()
const {
  value: isPopupMenuShown,
  toggle: togglePopupMenu,
  close: closePopupMenu
} = useToggle(false)

const onClickNotification = () => {
  if (!props.notification.disabled) emit('clickNotification')
}
const onClickMore = () => {
  if (slots.menu) togglePopupMenu()
  emit('clickMore')
}

const starTooltip = computed(() =>
  props.isStarred ? 'お気に入りから外す' : 'お気に入りに追加する'
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.moreButton {
  position: relative;
  display: inline;
}
.toolsMenu {
  position: absolute;
  right: 0;
  top: 100%;
  width: max-content;
  z-index: $z-index-header-tools;
  contain: layout style;
}
</style>
