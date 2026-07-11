<template>
  <SidebarContentContainerLink
    title="スレッド"
    :count="threadsLength"
    @click-link="emit('clickLink')"
  />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerLink.vue'

withDefaults(
  defineProps<{
    threadsLength?: number
  }>(),
  {
    threadsLength: 0
  }
)

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>
