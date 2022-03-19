<template>
  <template v-if="shouldShowSidebar">
    <teleport :disabled="!isMobile" to="#sidebar-mobile">
      <slot name="page" />
    </teleport>
  </template>
  <!-- #sidebar-openerが存在する前にはマウントできないのでisSidebarOpenerReadyをチェック -->
  <teleport v-else-if="isSidebarOpenerReady" to="#sidebar-opener">
    <slot name="opener" />
  </teleport>
</template>

<script lang="ts" setup>
import useSidebar from '/@/composables/mainView/useSidebar'
import { useResponsiveStore } from '/@/store/ui/responsive'

defineProps<{
  isSidebarOpenerReady: boolean
}>()

const { shouldShowSidebar } = useSidebar()
const { isMobile } = useResponsiveStore()
</script>
