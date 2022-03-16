<template>
  <teleport v-if="shouldShowSidebar" :to="portalTarget">
    <slot name="page" />
  </teleport>
  <!-- #sidebar-openerが存在する前にはマウントできないのでisSidebarOpenerReadyをチェック -->
  <teleport v-else-if="isSidebarOpenerReady" to="#sidebar-opener">
    <slot name="opener" />
  </teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import useSidebar from '/@/composables/useSidebar'
import { useResponsiveStore } from '/@/store/ui/responsive'

defineProps<{
    isSidebarOpenerReady: boolean
}>()

const { shouldShowSidebar } = useSidebar()
const { isMobile } = useResponsiveStore()

const portalTarget = computed(() =>
  isMobile.value ? '#sidebar-mobile' : '#sidebar'
)
</script>
