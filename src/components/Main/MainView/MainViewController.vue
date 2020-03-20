<template>
  <div :class="$style.container">
    <div :class="$style.headerContainer">
      <main-view-header :channel-id="channelId" />
    </div>
    <div :class="$style.layoutContainer" :data-layout="state.layout">
      <main-view-component-selector
        :class="[$style.componentContainer, $style.primary]"
        :viewInfo="state.primary"
      />
      <main-view-component-selector
        :class="[$style.componentContainer, $style.secondary]"
        :viewInfo="state.secondary"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'

import MainViewComponentSelector from './MainViewComponentSelector.vue'
import MainViewHeader from './MainViewHeader/MainViewHeader.vue'

export default defineComponent({
  name: 'MainViewController',
  components: { MainViewComponentSelector, MainViewHeader },
  setup() {
    const state = reactive({
      layout: computed(() => store.state.ui.mainView.layout),
      primary: computed(() => store.state.ui.mainView.primaryView),
      secondary: computed(() => store.state.ui.mainView.secondaryView)
    })
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )

    return {
      state,
      channelId
    }
  }
})
</script>

<style lang="scss" module>
$headerHeight: 80px;

.container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}
.componentContainer {
  height: 100%;
}
.headerContainer {
  height: $headerHeight;
  width: 100%;
  flex: 0 0 $headerHeight;
}

// レイアウト系
.layoutContainer {
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
</style>
