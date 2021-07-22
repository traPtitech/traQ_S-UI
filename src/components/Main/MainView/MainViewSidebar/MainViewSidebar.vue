<template>
  <teleport v-if="shouldShowSidebar" :to="portalTarget">
    <slot name="page" />
  </teleport>
  <!-- #sidebar-openerが存在する前にはマウントできないのでisSidebarOpenerReadyをチェック -->
  <teleport v-else-if="isSidebarOpenerReady" to="#sidebar-opener">
    <slot name="opener" />
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import useSidebar from '/@/use/sidebar'
import useIsMobile from '/@/use/isMobile'

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
    const { isMobile } = useIsMobile()

    const portalTarget = computed(() =>
      isMobile.value ? '#sidebar-mobile' : '#sidebar'
    )

    return { shouldShowSidebar, portalTarget }
  }
})
</script>
