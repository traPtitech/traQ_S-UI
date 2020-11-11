<template>
  <teleport v-if="shouldShowSidebar" to="#sidebar">
    <slot name="page" />
  </teleport>
  <!-- #sidebar-openerが存在する前にはマウントできないのでisSidebarOpenerReadyをチェック -->
  <teleport v-else-if="isSidebarOpenerReady" to="#sidebar-opener">
    <slot name="opener" />
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useSidebar from '@/use/sidebar'

export default defineComponent({
  name: 'MainViewSidebar',
  props: {
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const { shouldShowSidebar } = useSidebar()
    return { shouldShowSidebar }
  }
})
</script>
