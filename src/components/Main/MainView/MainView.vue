<template>
  <div :class="$style.container">
    <main-view-header-selector
      :class="$style.headerContainer"
      :view-info="state.primary"
    />
    <main-view-sidebar-selector :view-info="state.primary" />
    <div :class="$style.layoutContainer" :data-layout="state.layout">
      <div :class="$style.primaryContainer">
        <main-view-component-selector
          :class="[$style.componentContainer, $style.primary]"
          :view-info="state.primary"
        />
        <portal-target
          name="sidebar"
          v-if="!isMobile"
          :class="$style.sidebar"
        />
      </div>
      <portal-target name="sidebar-opener" :class="$style.hidden" />
      <main-view-component-selector
        v-if="state.secondary"
        :class="[$style.componentContainer, $style.secondary]"
        :view-info="state.secondary"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import useIsMobile from '@/use/isMobile'
import MainViewComponentSelector from './MainViewComponentSelector.vue'
import MainViewHeaderSelector from './MainViewHeaderSelector.vue'
import MainViewSidebarSelector from './MainViewSidebarSelector.vue'

export default defineComponent({
  name: 'MainView',
  components: {
    MainViewComponentSelector,
    MainViewHeaderSelector,
    MainViewSidebarSelector
  },
  setup() {
    const state = reactive({
      layout: computed(() => store.state.ui.mainView.layout),
      primary: computed(() => store.state.ui.mainView.primaryView),
      secondary: computed(() => store.state.ui.mainView.secondaryView)
    })
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { isMobile } = useIsMobile()

    return {
      state,
      channelId,
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
.headerContainer {
  width: 100%;
}
.container {
  height: 100%;
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
}
.primary {
  width: 100%;
}
.primaryContainer {
  display: flex;
  height: 100%;
}
.sidebar {
  height: 100%;
  flex-shrink: 0;
}
</style>
