<template>
  <div :class="$style.container">
    <desktop-tab-selector
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <desktop-tab-frame :current-navigation="currentNavigation" />
    <close-button :class="$style.close" with-text @click="close" :size="56" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import store from '@/store'
import { useNavigation } from './use/navigation'
import DesktopTabSelector from './DesktopTabSelector.vue'
import DesktopTabFrame from './DesktopTabFrame.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

export default defineComponent({
  name: 'DesktopSettingModal',
  setup() {
    const { navigationSelectorState, onNavigationChange } = useNavigation()

    const close = () => store.dispatch.ui.modal.clearModal()

    return {
      ...toRefs(navigationSelectorState),
      onNavigationChange,
      close
    }
  },
  components: {
    DesktopTabSelector,
    DesktopTabFrame,
    CloseButton
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  height: 100%;
}

.close {
  position: absolute;
  top: 30px;
  right: 120px;
}
</style>
