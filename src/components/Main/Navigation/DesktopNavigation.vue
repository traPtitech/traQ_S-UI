<template>
  <div :class="$style.container" :style="navigationStyle">
    <div :class="$style.selector">
      <desktop-navigation-selector
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
    </div>
    <div class="$style.navigations">
      <navigation-content
        class="$style.navigation"
        :current-navigation="navigationSelectorState.currentNavigation"
      />
      <ephemeral-navigation-content
        class="$style.navigation"
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
import EphemeralNavigationContent from '@/components/Main/Navigation/EphemeralNavigationContent.vue'
import DesktopNavigationSelector from '@/components/Main/Navigation/DesktopNavigationSelector.vue'
import {
  useNavigation,
  useEphemeralNavigation,
  EphemeralNavigationItemType
} from '@/components/Main/Navigation/use/navigation'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'DesktopNavigation',
  components: {
    NavigationContent,
    EphemeralNavigationContent,
    DesktopNavigationSelector
  },
  setup() {
    const { navigationSelectorState, onNavigationChange } = useNavigation()
    const {
      navigationSelectorState: ephemeralNavigationSelectorState,
      onNavigationChange: _onEphemeralNavigationChange
    } = useEphemeralNavigation()
    const navigationStyle = makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))

    // もう一度押すと消えて欲しいので一段階ラップ
    const onEphemeralNavigationChange = (type: EphemeralNavigationItemType) => {
      if (ephemeralNavigationSelectorState.currentNavigation === type) {
        _onEphemeralNavigationChange(undefined)
      } else {
        _onEphemeralNavigationChange(type)
      }
    }

    return {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      navigationStyle
    }
  }
})
</script>

<style lang="scss" module>
$selectorWidth: 64px;
.container {
  display: flex;
  width: 100%;
  height: 100%;
}
.selector {
  display: flex;
  justify-content: center;
  width: $selectorWidth;
  height: 100%;
  flex-shrink: 0;
}
.navigations {
  display: flex;
  flex-direction: column;
}
.navigation {
  width: 100%;
}
</style>
