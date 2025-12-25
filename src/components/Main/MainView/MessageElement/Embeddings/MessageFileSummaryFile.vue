<template>
  <RouterLink :to="fileLink" :class="$style.container" @click.stop>
    <FileTypeIcon
      :type="fileType"
      :size="24"
      :is-animated-image="isAnimatedImage"
    />
    <div>{{ fileMeta?.name ?? 'unknown' }}</div>
  </RouterLink>
</template>

<script lang="ts" setup>
import FileTypeIcon from '/@/components/UI/FileTypeIcon.vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import type { FileId } from '/@/types/entity-ids'

const props = defineProps<{
  fileId: FileId
}>()

const { fileType, fileMeta, fileLink, isAnimatedImage } = useFileMeta(props)
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
