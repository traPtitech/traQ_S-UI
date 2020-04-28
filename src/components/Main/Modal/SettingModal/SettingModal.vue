<template>
  <div :class="$style.container">
    <mobile-setting-modal v-if="isMobile" />
    <desktop-setting-modal v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useIsMobile from '@/use/isMobile'
import DesktopSettingModal from './DesktopSettingModal.vue'
import MobileSettingModal from './MobileSettingModal.vue'

export default defineComponent({
  name: 'SettingModal',
  setup() {
    const { isMobile } = useIsMobile()
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
