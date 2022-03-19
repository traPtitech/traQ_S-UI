<template>
  <div :class="$style.primaryContainer">
    <teleport v-if="isReady" to="#header">
      <main-view-header-selector :view-info="primaryView" />
    </teleport>
    <main-view-component-selector
      :class="$style.primary"
      :view-info="primaryView"
    />
    <div :class="$style.sidebar">
      <main-view-sidebar-selector
        :view-info="primaryView"
        :is-sidebar-opener-ready="isReady"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MainViewHeaderSelector from './MainViewHeaderSelector.vue'
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import MainViewSidebarSelector from './MainViewSidebarSelector.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { primaryView } = useMainViewStore()

defineProps<{
  isReady: boolean
}>()
</script>

<style lang="scss" module>
.primaryContainer {
  display: flex;
  height: 100%;
}

.primary {
  min-width: 0;
  width: 100%;
}

.sidebar {
  height: 100%;
  flex-shrink: 0;
  z-index: $z-index-sidebar;
}
</style>
