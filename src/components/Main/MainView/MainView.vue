<template>
  <div :class="$style.container">
    <div id="header" :class="$style.headerContainer"></div>
    <div :class="$style.layoutContainer" :data-layout="layout">
      <primary-view-selector :is-ready="isMounted" />
      <div id="sidebar-opener" :class="$style.hidden" />
      <main-view-component-selector
        v-if="secondaryView"
        :class="[$style.componentContainer, $style.secondary]"
        :view-info="secondaryView"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMainViewStore } from '/@/store/ui/mainView'
import PrimaryViewSelector from './PrimaryViewSelector.vue'

const { layout, secondaryView } = useMainViewStore()

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
.componentContainer {
  height: 100%;
}

// レイアウト系
.layoutContainer {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  &[data-layout='single'] {
    .secondary {
      display: none;
    }
  }
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
