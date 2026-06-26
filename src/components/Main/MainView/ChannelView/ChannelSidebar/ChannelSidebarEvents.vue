<template>
  <SidebarContentContainerLink
    title="イベント"
    @click-link="emit('clickLink')"
    icon-name="history"
    icon-mdi
  />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerLink.vue'

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>
