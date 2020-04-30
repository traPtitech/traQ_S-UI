<template>
  <nav
    :class="$style.container"
    :style="styles.container"
    :data-has-ephemeral-content="
      ephemeralNavigationSelectorState.currentNavigation
    "
  >
    <div>
      <mobile-tool-box :class="$style.toolBox" />
      <portal-target :name="targetPortalName" />
    </div>
    <div :class="$style.content" :style="styles.componentWrap">
      <navigation-content
        :current-navigation="navigationSelectorState.currentNavigation"
      />
    </div>
    <div
      v-if="ephemeralNavigationSelectorState.currentNavigation"
      :class="$style.ephemeralContent"
      :style="styles.componentWrap"
    >
      <ephemeral-navigation-content
        :class="$style.ephemeralNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
    </div>
    <div :class="$style.selector" :style="styles.componentWrap">
      <navigation-selector
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import EphemeralNavigationContent from '@/components/Main/Navigation/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import MobileToolBox, {
  targetPortalName
} from '@/components/Main/Navigation/MobileToolBox.vue'
import NavigationSelector from '@/components/Main/Navigation/MobileNavigationSelector.vue'
import useNavigation from './use/navigation'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.tertiary
    })),
    componentWrap: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MobileNavigation',
  components: {
    NavigationContent,
    EphemeralNavigationContent,
    NavigationSelector,
    MobileToolBox
  },

  setup() {
    const styles = useStyles()
    const {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd
    } = useNavigation()

    return {
      styles,
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd,
      targetPortalName
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'toolbox' min-content
    'content' 1fr
    'selector' 60px;
  row-gap: 16px;
  width: 100%;
  height: 100%;
  padding: 16px;
  &[data-has-ephemeral-content] {
    grid-template:
      'toolbox' min-content
      'content' 2fr
      'ephemeral-content' auto
      'selector' 60px;
  }
}
.toolBox,
.content,
.selector {
  border-radius: 4px;
  overflow: hidden;
}
.toolBox {
  grid-area: toolbox;
}
.content {
  grid-area: content;
}
.ephemeralContent {
  grid-area: ephemeral-content;
}
.selector {
  grid-area: selector;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  flex-shrink: 0;
}
</style>
