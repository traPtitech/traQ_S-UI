<template>
  <div :class="$style.container" :style="styles.container">
    <play-icon v-if="isAnimatedImage" :class="$style.playIcon" />
  </div>
</template>

<script lang="ts">
import useFileThumbnail from '/@/composables/useFileThumbnail'
import { reactive, Ref, computed } from 'vue'

const useStyles = (path: Ref<string>) =>
  reactive({
    container: computed(() => ({
      backgroundImage: `url(${path.value})`
    }))
  })
</script>

<script lang="ts" setup>
import PlayIcon from '/@/components/UI/PlayIcon.vue'

const props = defineProps<{
  fileId: string
}>()

const { fileThumbnailPath, isAnimatedImage } = useFileThumbnail(props)
const styles = useStyles(fileThumbnailPath)
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
