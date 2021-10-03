<template>
  <nav
    :class="$style.container"
    :data-has-ephemeral-content="
      $boolAttr(!!ephemeralNavigationSelectorState.currentNavigation)
    "
  >
    <div>
      <mobile-tool-box :class="$style.toolBox" />
      <div :id="teleportTargetName" />
    </div>
    <div :class="$style.content">
      <navigation-content
        :current-navigation="navigationSelectorState.currentNavigation"
      />
    </div>
    <div
      v-if="ephemeralNavigationSelectorState.currentNavigation"
      :class="$style.ephemeralContent"
    >
      <ephemeral-navigation-content
        transparent
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
    </div>
    <div :class="$style.selector">
      <navigation-selector
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
      />
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationContent from '/@/components/Main/Navigation/NavigationContent.vue'
import EphemeralNavigationContent from '/@/components/Main/Navigation/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import MobileToolBox, {
  teleportTargetName
} from '/@/components/Main/Navigation/MobileToolBox.vue'
import NavigationSelector from '/@/components/Main/Navigation/MobileNavigationSelector.vue'
import useNavigation from './use/navigation'

export default defineComponent({
  name: 'MobileNavigation',
  components: {
    NavigationContent,
    EphemeralNavigationContent,
    NavigationSelector,
    MobileToolBox
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

    return {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd,
      teleportTargetName
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-tertiary;
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
.ephemeralContent,
.selector {
  border-radius: 4px;
  overflow: hidden;
}
.toolBox {
  grid-area: toolbox;
}
.content {
  @include background-secondary;
  grid-area: content;
  padding-left: 8px;
}
.ephemeralContent {
  @include background-secondary;
  grid-area: ephemeral-content;
  padding: {
    top: 4px;
    left: 4px;
    right: 4px;
  }
}
.selector {
  @include background-secondary;
  grid-area: selector;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  flex-shrink: 0;
}
</style>
