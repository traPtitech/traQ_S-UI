<template>
  <RouterLink :to="fileLink" :class="$style.container" @click.stop>
    <SkeletonImage
      :src="fileThumbnailPath"
      fixed
      width="9rem"
      height="6rem"
      :class="$style.image"
      background
    />
    <PlayIcon v-if="isAnimatedImage" :class="$style.playIcon" />
  </RouterLink>
</template>

<script lang="ts" setup>
import PlayIcon from '/@/components/UI/PlayIcon.vue'
import SkeletonImage from '/@/components/UI/SkeletonImage.vue'
import useFileThumbnail from '/@/composables/files/useFileThumbnail'
import type { FileId } from '/@/types/entity-ids'

const props = defineProps<{
  fileId: FileId
}>()

const { fileLink, fileThumbnailPath, isAnimatedImage } = useFileThumbnail(props)
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: block;
}

.image {
  border: 2px solid $theme-background-secondary-border;
  border-radius: 6px;
  overflow: hidden;
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
}

.playIcon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
</style>
