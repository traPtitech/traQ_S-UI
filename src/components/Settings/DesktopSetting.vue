<template>
  <div :class="$style.container">
    <desktop-tab-selector :class="$style.selector" />
    <desktop-tab-frame :class="$style.frame">
      <slot />
    </desktop-tab-frame>
    <close-button :class="$style.close" with-text :size="56" @close="close" />
  </div>
</template>

<script lang="ts" setup>
import CloseButton from '/@/components/UI/CloseButton.vue'
import DesktopTabSelector from './DesktopTabSelector.vue'
import DesktopTabFrame from './DesktopTabFrame.vue'
import useSettingsNavigation from '/@/components/Settings/composables/useNavigation'

const { close } = useSettingsNavigation()
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  height: 100%;
}

.selector {
  max-width: 260px;
  flex: 2;
}
.frame {
  flex: 3;
}

.close {
  position: absolute;
  top: 30px;
  right: 60px;
}
</style>
