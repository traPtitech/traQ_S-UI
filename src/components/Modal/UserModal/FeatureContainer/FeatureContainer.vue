<template>
  <MobileFeatureContainer v-if="isMobile" :user="user" :detail="detail" />
  <DesktopFeatureContainer v-else :user="user" :detail="detail" />
</template>

<script lang="ts" setup>
import DesktopFeatureContainer from './DesktopFeatureContainer.vue'
import MobileFeatureContainer from './MobileFeatureContainer.vue'
import type { User, UserDetail } from '@traptitech/traq'
import useResponsive from '/@/composables/useResponsive'

defineProps<{
  user: User
  detail?: UserDetail
}>()

const { isMobile } = useResponsive()
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
