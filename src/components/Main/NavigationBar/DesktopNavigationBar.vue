<template>
  <div :class="$style.container">
    <div :class="$style.selector">
      <desktop-navigation-selector
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
      />
      <desktop-tool-box />
    </div>
    <div :class="$style.navigations">
      <navigation-content
        :class="$style.navigation"
        :current-navigation="navigationSelectorState.currentNavigation"
      />
      <transition name="fade-bottom">
        <ephemeral-navigation-content
          v-if="ephemeralNavigationSelectorState.currentNavigation"
          :class="$style.ephemeralNavigation"
          :current-ephemeral-navigation="
            ephemeralNavigationSelectorState.currentNavigation
          "
        />
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavigationContent from '/@/components/Main/NavigationBar/NavigationContent.vue'
import EphemeralNavigationContent from '/@/components/Main/NavigationBar/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import DesktopNavigationSelector from '/@/components/Main/NavigationBar/DesktopNavigationSelector.vue'
import DesktopToolBox from '/@/components/Main/NavigationBar/DesktopToolBox.vue'
import useNavigation from './composables/useNavigation'

const {
  navigationSelectorState,
  ephemeralNavigationSelectorState,
  onNavigationChange,
  onEphemeralNavigationChange,
  onEphemeralEntryRemove,
  onEphemeralEntryAdd
} = useNavigation()
</script>

<style lang="scss" module>
$ephemeralNavigationSideMargin: 8px;
$ephemeralNavigationMinHeight: 64px;

.container {
  @include color-ui-primary;
  display: flex;
  width: 100%;
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
.navigation {
  width: 100%;
}
.ephemeralNavigation {
  width: #{calc(100% - #{$ephemeralNavigationSideMargin * 2})};
  margin: 0 $ephemeralNavigationSideMargin;
  flex: 0 1 $ephemeralNavigationMinHeight;
}
</style>
