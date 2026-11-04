<template>
  <SidebarContentContainer
    :title="title"
    :tooltip="tooltip"
    :large-padding="largePadding"
    clickable
    title-clickable
    @toggle="emit('click')"
  >
    <template #header-control>
      <slot />
    </template>
  </SidebarContentContainer>
</template>

<script lang="ts" setup>
import SidebarContentContainer from './SidebarContentContainer.vue'

withDefaults(
  defineProps<{
    title: string
    tooltip?: string
    largePadding?: boolean
  }>(),
  {
    largePadding: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
