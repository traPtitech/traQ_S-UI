<template>
  <main-view-component-selector
    v-if="secondaryView"
    :class="$style.secondary"
    :view-info="secondaryView"
  />
</template>

<script lang="ts" setup>
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { secondaryView } = useMainViewStore()
</script>

<style lang="scss" module>
.secondary {
  height: 100%;
}
</style>
