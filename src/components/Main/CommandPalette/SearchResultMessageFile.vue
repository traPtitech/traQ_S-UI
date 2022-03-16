<template>
  <div :class="$style.container">
    <file-type-icon
      :type="fileType"
      :size="24"
      :is-animated-image="isAnimatedImage"
    />
    <div>{{ name }}</div>
  </div>
</template>

<script lang="ts" setup>
import FileTypeIcon from '/@/components/UI/FileTypeIcon.vue'
import { computed } from 'vue'
import useFileMeta from '/@/composables/useFileMeta'

const props = defineProps<{
  fileId: string
}>()

const { fileType, fileMeta, isAnimatedImage } = useFileMeta(props)
const name = computed(() => fileMeta.value?.name ?? 'unknown')
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template-columns: 1.5rem max-content;
  column-gap: 1rem;
  padding: 0.5rem 1rem;
  border: 2px solid $theme-ui-secondary-default;
  border-radius: 4px;
  overflow: hidden;
}
</style>
