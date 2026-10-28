<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage>
        <template #header>
          <SidebarHeader text="スレッド" />
        </template>
        <template #content> </template>
      </PrimaryViewSidebarPage>
    </template>
  </PrimaryViewSidebar>
</template>

<script lang="ts" setup>
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'

defineProps<{
  isSidebarOpenerReady: boolean
}>()
</script>
