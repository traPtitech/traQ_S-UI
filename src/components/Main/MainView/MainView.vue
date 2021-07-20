<template>
  <div :class="$style.container">
    <main-view-header-selector
      :class="$style.headerContainer"
      :view-info="state.primary"
    />
    <main-view-sidebar-selector
      :view-info="state.primary"
      :is-sidebar-opener-ready="isMounted"
    />
    <div :class="$style.layoutContainer" :data-layout="state.layout">
      <div :class="$style.primaryContainer">
        <main-view-component-selector
          :class="[$style.componentContainer, $style.primary]"
          :view-info="state.primary"
        />
        <div id="sidebar" :class="$style.sidebar" />
      </div>
      <div id="sidebar-opener" :class="$style.hidden" />
      <main-view-component-selector
        v-if="state.secondary"
        :class="[$style.componentContainer, $style.secondary]"
        :view-info="state.secondary"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  ref,
  onMounted,
  onBeforeUnmount
} from 'vue'
import store from '/@/store'
import useIsMobile from '/@/use/isMobile'
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

    const isMounted = ref(false)
    onMounted(() => {
      isMounted.value = true
    })
    onBeforeUnmount(() => {
      isMounted.value = false
    })

    return {
      state,
      channelId,
      isMobile,
      isMounted
    }
  }
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
