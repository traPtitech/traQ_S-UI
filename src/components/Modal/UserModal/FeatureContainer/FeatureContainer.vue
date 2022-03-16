<template>
  <mobile-feature-container v-if="isMobile" :user="user" :detail="detail" />
  <desktop-feature-container v-else :user="user" :detail="detail" />
</template>

<script lang="ts" setup>
import DesktopFeatureContainer from './DesktopFeatureContainer.vue'
import MobileFeatureContainer from './MobileFeatureContainer.vue'
import { User, UserDetail } from '@traptitech/traq'
import { useResponsiveStore } from '/@/store/ui/responsive'

defineProps<{
  user: User
  detail?: UserDetail
}>()

const { isMobile } = useResponsiveStore()
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
