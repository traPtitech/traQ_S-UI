<template>
  <SidebarContentContainerLink
    title="デフォルトの通知設定"
    icon-name="defaultNotification"
    icon-mdi
    @click-link="emit('clickLink')"
  />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerLink.vue'

defineProps<{
  defaultNotification: string
}>()

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>
