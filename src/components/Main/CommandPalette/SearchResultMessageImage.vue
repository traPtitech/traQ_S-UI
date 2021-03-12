<template>
  <div :class="$style.container" :style="styles.container"></div>
</template>

<script lang="ts">
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import { defineComponent, reactive, Ref } from 'vue'

const useStyles = (path: Ref<string>) =>
  reactive({
    container: makeStyles(() => ({
      backgroundImage: `url(${path.value})`
    }))
  })

export default defineComponent({
  name: 'SearchResultMessageImage',
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    const { fileThumbnailPath } = useFileMeta(props)
    const styles = useStyles(fileThumbnailPath)
    return { fileThumbnailPath, styles }
  }
})
</script>

<style lang="scss" module>
.container {
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
</style>
