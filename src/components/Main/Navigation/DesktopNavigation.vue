<template>
  <div :class="$style.container" :style="navigationStyle">
    <div :class="$style.selector">
      <desktop-navigation-selector
        @navigation-change="onNavigationChange"
        :current-navigation="currentNavigation"
      />
      <tool-box />
    </div>
    <portal-target :name="targetPortalName" />
    <navigation-content :current-navigation="currentNavigation" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from '@vue/composition-api'
import DesktopNavigationSelector from '@/components/Main/Navigation/DesktopNavigationSelector.vue'
import ToolBox, {
  targetPortalName
} from '@/components/Main/Navigation/ToolBox.vue'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import { useNavigation } from '@/components/Main/Navigation/use/navigation'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'DesktopNavigation',
  components: { NavigationContent, DesktopNavigationSelector, ToolBox },
  setup() {
    const { navigationSelectorState, onNavigationChange } = useNavigation()
    const navigationStyle = makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))
    return {
      ...toRefs(navigationSelectorState),
      onNavigationChange,
      navigationStyle,
      targetPortalName
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
  flex-direction: column;
  justify-content: center;
  width: $selectorWidth;
  height: 100%;
  flex-shrink: 0;
}
</style>
