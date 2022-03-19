<template>
  <sidebar-content-container-link
    title="ピン留め"
    :count="pinnedMessageLength"
    @click-link="emit('clickLink')"
  />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerLink.vue'

withDefaults(
  defineProps<{
    pinnedMessageLength?: number
  }>(),
  {
    pinnedMessageLength: 0
  }
)

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>
