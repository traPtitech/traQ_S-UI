<template>
  <main-view-component-selector
    :class="$style.primary"
    :view-info="primaryView"
  />
</template>

<script lang="ts" setup>
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { primaryView } = useMainViewStore()
</script>

<style lang="scss" module>
.primary {
  min-width: 0;
  width: 100%;
}
</style>
