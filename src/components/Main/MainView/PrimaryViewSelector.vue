<template>
  <teleport v-if="isReady" to="#header">
    <main-view-header-selector :view-info="primaryView" />
  </teleport>
  <main-view-component-selector
    :class="$style.primary"
    :view-info="primaryView"
  />
</template>

<script lang="ts" setup>
import MainViewHeaderSelector from './MainViewHeaderSelector.vue'
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { primaryView } = useMainViewStore()

defineProps<{
  isReady: boolean
}>()
</script>

<style lang="scss" module>
.primary {
  min-width: 0;
  width: 100%;
}
</style>
