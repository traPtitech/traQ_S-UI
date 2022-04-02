<template>
  <div :class="$style.container" :style="containerStyle">
    <play-icon v-if="isAnimatedImage" :class="$style.playIcon" />
  </div>
</template>

<script lang="ts" setup>
import useFileThumbnail from '/@/composables/files/useFileThumbnail'
import { computed } from 'vue'
import PlayIcon from '/@/components/UI/PlayIcon.vue'
import type { FileId } from '/@/types/entity-ids'

const props = defineProps<{
  fileId: FileId
}>()

const { fileThumbnailPath, isAnimatedImage } = useFileThumbnail(props)
const containerStyle = computed(() => ({
  backgroundImage: `url(${fileThumbnailPath.value})`
}))
</script>

<style lang="scss" module>
.container {
  position: relative;
  border: 2px solid $theme-background-secondary-border;
  border-radius: 6px; // border分
  height: 6rem;
  width: 9rem;
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
