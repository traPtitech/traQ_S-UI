<template>
  <template v-if="shouldShowSidebar">
    <teleport :disabled="!isMobile" to="#sidebar-mobile">
      <slot name="page" />
    </teleport>
  </template>
  <!-- #sidebar-openerが存在する前にはマウントできないのでisSidebarOpenerReadyをチェック -->
  <teleport
    v-if="isSidebarOpenerReady && shouldShowHiddenSidebar"
    to="#sidebar-opener"
  >
    <slot name="opener" />
  </teleport>
</template>

<script lang="ts" setup>
import useSidebar from '/@/composables/mainView/useSidebar'
import useResponsive from '/@/composables/useResponsive'

defineProps<{
  isSidebarOpenerReady: boolean
}>()

const { shouldShowSidebar, shouldShowHiddenSidebar } = useSidebar()
const { isMobile } = useResponsive()
</script>
