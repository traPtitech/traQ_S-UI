<template>
  <div :class="$style.container">
    <main-view-header-selector
      :class="$style.headerContainer"
      :view-info="primaryView"
    />
    <main-view-sidebar-selector
      :view-info="primaryView"
      :is-sidebar-opener-ready="isMounted"
    />
    <div :class="$style.layoutContainer" :data-layout="layout">
      <div :class="$style.primaryContainer">
        <main-view-component-selector
          :class="[$style.componentContainer, $style.primary]"
          :view-info="primaryView"
        />
        <div id="sidebar" :class="$style.sidebar" />
      </div>
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
import MainViewComponentSelector from './MainViewComponentSelector.vue';
import MainViewHeaderSelector from './MainViewHeaderSelector.vue';
import MainViewSidebarSelector from './MainViewSidebarSelector.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useMainViewStore } from '/@/store/ui/mainView'

const { layout, primaryView, secondaryView } = useMainViewStore()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
onBeforeUnmount(() => {
  isMounted.value = false
})
</script>

<style lang="scss" module>
.headerContainer {
  width: 100%;
  z-index: $z-index-header;
}
.container {
  position: relative;
  display: flex;
  flex-direction: column;
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
.primary {
  min-width: 0;
  width: 100%;
}
.primaryContainer {
  display: flex;
  height: 100%;
}
.sidebar {
  height: 100%;
  flex-shrink: 0;
  z-index: $z-index-sidebar;
}
</style>
