<template>
  <div :class="$style.container" :style="styles.container">
    <play-icon v-if="isAnimatedImage" :class="$style.playIcon" />
  </div>
</template>

<script lang="ts">
import { makeStyles } from '/@/lib/styles'
import useFileThumbnail from '/@/use/fileThumbnail'
import { defineComponent, reactive, Ref } from 'vue'
import PlayIcon from '/@/components/UI/PlayIcon.vue'

const useStyles = (path: Ref<string>) =>
  reactive({
    container: makeStyles(() => ({
      backgroundImage: `url(${path.value})`
    }))
  })

export default defineComponent({
  name: 'SearchResultMessageImage',
  components: {
    PlayIcon
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { fileThumbnailPath, isAnimatedImage } = useFileThumbnail(props)
    const styles = useStyles(fileThumbnailPath)
    return { fileThumbnailPath, isAnimatedImage, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  border: 2px solid $theme-background-secondary;
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
