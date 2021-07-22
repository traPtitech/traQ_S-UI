<template>
  <div :class="$style.container">
    <desktop-tab-selector />
    <desktop-tab-frame>
      <slot />
    </desktop-tab-frame>
    <close-button :class="$style.close" with-text :size="56" @close="close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CloseButton from '/@/components/UI/CloseButton.vue'
import DesktopTabSelector from './DesktopTabSelector.vue'
import DesktopTabFrame from './DesktopTabFrame.vue'
import useSettingsNavigation from '/@/components/Settings/use/navigation'

export default defineComponent({
  name: 'DesktopSettingModal',
  components: {
    DesktopTabSelector,
    DesktopTabFrame,
    CloseButton
  },
  setup() {
    const { close } = useSettingsNavigation()
    return { close }
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
  right: 60px;
}
</style>
