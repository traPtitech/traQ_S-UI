<template>
  <div :class="$style.container">
    <mobile-setting-modal v-if="isMobile" />
    <desktop-setting-modal v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import DesktopSettingModal from './DesktopSettingModal.vue'
import MobileSettingModal from './MobileSettingModal.vue'

export default defineComponent({
  name: 'SettingModal',
  setup() {
    const isMobile = computed(() => store.getters.ui.isMobile)
    return { isMobile }
  },
  components: {
    DesktopSettingModal,
    MobileSettingModal
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
