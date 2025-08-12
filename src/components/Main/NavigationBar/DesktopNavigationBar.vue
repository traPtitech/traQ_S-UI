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
    <div :class="$style.resizer" @mousedown="startResizing" />
  </div>
</template>

<script lang="ts" setup>
import NavigationContent from '/@/components/Main/NavigationBar/NavigationContent.vue'
import EphemeralNavigationContent from '/@/components/Main/NavigationBar/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import DesktopNavigationSelector from '/@/components/Main/NavigationBar/DesktopNavigationSelector.vue'
import DesktopToolBox from '/@/components/Main/NavigationBar/DesktopToolBox.vue'
import useNavigation from './composables/useNavigation'
import { useNavigationResizer } from '/@/composables/dom/useNavigationResizer'

const {
  navigationSelectorState,
  ephemeralNavigationSelectorState,
  onNavigationChange,
  onEphemeralNavigationChange,
  onEphemeralEntryRemove,
  onEphemeralEntryAdd
} = useNavigation()

const { isNavigationClosed, startResizing, navigationWidth } =
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
  width: 2px;
  height: 100%;
  position: absolute;
  z-index: $z-index-sidebar;
  right: 0;
  top: 0;
  background-color: transparent;
  cursor: e-resize;

  &:hover {
    background-color: $theme-accent-focus-default;
  }

  &:active {
    background-color: $theme-accent-primary-default;
  }

  // ヒット領域を拡張
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    right: -8px;
    top: 0;
    bottom: 0;
    background-color: transparent;
  }
}
</style>
