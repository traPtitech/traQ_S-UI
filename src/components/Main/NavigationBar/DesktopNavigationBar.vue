<template>
  <div :class="$style.container">
    <div
      :class="[
        $style.selector,
        { [$style.scrollbarHidden]: isNavigationClosed }
      ]"
    >
      <DesktopNavigationSelector
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
        :show-current="!isNavigationClosed"
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
      />
      <DesktopToolBox />
    </div>
    <div
      ref="navigationRef"
      :style="{ width: `${navigationWidth}px` }"
      :class="[$style.navigations, { [$style.hidden]: isNavigationClosed }]"
    >
      <NavigationContent
        :current-navigation="navigationSelectorState.currentNavigation"
      />
      <transition name="fade-bottom">
        <EphemeralNavigationContent
          v-if="ephemeralNavigationSelectorState.currentNavigation"
          :class="$style.ephemeralNavigation"
          :current-ephemeral-navigation="
            ephemeralNavigationSelectorState.currentNavigation
          "
        />
      </transition>
    </div>
    <div
      ref="navigationResizerRef"
      :class="$style.resizer"
      @pointerdown="onDragStart"
      @pointermove="onDragging"
      @pointerup="onDragEnd"
    />
  </div>
</template>

<script lang="ts" setup>
import NavigationContent from '/@/components/Main/NavigationBar/NavigationContent.vue'
import EphemeralNavigationContent from '/@/components/Main/NavigationBar/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import DesktopNavigationSelector from '/@/components/Main/NavigationBar/DesktopNavigationSelector.vue'
import DesktopToolBox from '/@/components/Main/NavigationBar/DesktopToolBox.vue'
import useNavigation from './composables/useNavigation'
import { useNavigationResizer } from '/@/composables/dom/useNavigationResizer'
import { useNavigationLayoutStore } from '/@/store/ui/navigationLayout'

const {
  navigationSelectorState,
  ephemeralNavigationSelectorState,
  onNavigationChange,
  onEphemeralNavigationChange,
  onEphemeralEntryRemove,
  onEphemeralEntryAdd
} = useNavigation()

const {
  isNavigationClosed,
  navigationRef,
  resizerRef: navigationResizerRef
} = useNavigationLayoutStore()

const { onDragStart, onDragging, onDragEnd, navigationWidth } =
  useNavigationResizer()
</script>

<style lang="scss" module>
$ephemeralNavigationSideMargin: 8px;
$ephemeralNavigationMinHeight: 64px;

.container {
  @include color-ui-primary;
  position: relative;
  display: flex;
  width: fit-content;
  height: 100%;
  background: var(--specific-navigation-bar-desktop-background);
}
.selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
.navigations {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.ephemeralNavigation {
  width: #{calc(100% - #{$ephemeralNavigationSideMargin * 2})};
  margin: 0 $ephemeralNavigationSideMargin;
  flex: 0 1 $ephemeralNavigationMinHeight;
}
.hidden {
  display: none;
}
.scrollbarHidden {
  scrollbar-width: none;
}
.resizer {
  width: 3px;
  height: 100%;
  position: absolute;
  z-index: $z-index-sidebar;
  right: -1px;
  top: 0;
  background-color: transparent;
  cursor: e-resize;

  transition: background-color 125ms linear;

  &:hover {
    background-color: $theme-accent-focus-default;
    transition: background-color 0.1s ease-out;
  }

  &:active {
    background-color: $theme-accent-primary-default;
    transition: background-color 0.1s ease-out;
  }

  // ヒット領域を拡張
  &::before {
    content: '';
    position: absolute;
    left: -2px;
    right: -12px;
    top: 0;
    bottom: 0;
    background-color: transparent;
  }
}
</style>
