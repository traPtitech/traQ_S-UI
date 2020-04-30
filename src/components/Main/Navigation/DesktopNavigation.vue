<template>
  <div :class="$style.container" :style="navigationStyle">
    <div :class="$style.selector">
      <desktop-navigation-selector
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
      <desktop-tool-box />
    </div>
    <portal-target :name="targetPortalName" />
    <div :class="$style.navigations">
      <navigation-content
        :class="$style.navigation"
        :current-navigation="navigationSelectorState.currentNavigation"
      />
      <ephemeral-navigation-content
        :class="$style.ephemeralNavigation"
        v-if="ephemeralNavigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import EphemeralNavigationContent from '@/components/Main/Navigation/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import useNavigation from './use/navigation'
import DesktopNavigationSelector from '@/components/Main/Navigation/DesktopNavigationSelector.vue'
import DesktopToolBox, {
  targetPortalName
} from '@/components/Main/Navigation/DesktopToolBox.vue'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'DesktopNavigation',
  components: {
    NavigationContent,
    EphemeralNavigationContent,
    DesktopNavigationSelector,
    DesktopToolBox
  },
  setup() {
    const {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd
    } = useNavigation()

    const navigationStyle = makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))

    return {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd,
      navigationStyle,
      targetPortalName
    }
  }
})
</script>

<style lang="scss" module>
$selectorWidth: 64px;
$ephemeralNavigationLeftMargin: 8px;
$ephemeralNavigationRightMargin: 16px;
$ephemeralNavigationMinHeight: 64px;

.container {
  display: flex;
  width: 100%;
  height: 100%;
}
.selector {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: $selectorWidth;
  height: 100%;
  flex-shrink: 0;
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
  width: #{calc(
      100% - #{$ephemeralNavigationLeftMargin + $ephemeralNavigationRightMargin}
    )};
  margin-left: $ephemeralNavigationLeftMargin;
  flex: 0 1 $ephemeralNavigationMinHeight;
}
</style>
