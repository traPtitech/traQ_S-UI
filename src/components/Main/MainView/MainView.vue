<template>
  <div :class="$style.container">
    <div id="header" :class="$style.headerContainer"></div>
    <div :class="$style.layoutContainer" :data-layout="layout">
      <primary-view-selector :is-ready="isMounted" />
      <div id="sidebar-opener" :class="$style.hidden" />
      <secondary-view-selector v-if="layout !== 'single'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMainViewStore } from '/@/store/ui/mainView'
import PrimaryViewSelector from './PrimaryViewSelector.vue'
import SecondaryViewSelector from './SecondaryViewSelector.vue'

const { layout } = useMainViewStore()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
onBeforeUnmount(() => {
  isMounted.value = false
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}

.headerContainer {
  width: 100%;
  z-index: $z-index-header;
}

.layoutContainer {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  &[data-layout|='split'] {
    display: flex;
  }
  &[data-layout='split'] {
    flex-direction: column;
  }
  &[data-layout='split-reverse'] {
    flex-direction: column-reverse;
  }
}

.hidden {
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: none;
}
</style>
