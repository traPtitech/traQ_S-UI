<template>
  <sidebar-content-container-link
    title="イベント"
    @click-link="emit('clickLink')"
  />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerLink.vue'

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>
