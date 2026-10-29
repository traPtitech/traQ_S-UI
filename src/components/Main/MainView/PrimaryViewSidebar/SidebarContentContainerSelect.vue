<template>
  <SidebarContentContainer
    :title="title"
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
