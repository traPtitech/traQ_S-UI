<template>
  <router-link
    :to="fileLink"
    v-if="isLarge"
    :class="$style.largeContainer"
    :style="styles.container"
  >
    <img draggable="false" :alt="fileMeta.name" :src="fileThumbnailPath" />
  </router-link>
  <router-link
    v-else
    :to="fileLink"
    :class="$style.container"
    :style="styles.container"
  >
    <img draggable="false" :alt="fileMeta.name" :src="fileThumbnailPath" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListItem',
  props: {
    isLarge: {
      type: Boolean,
      default: false
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { fileMeta, fileLink, fileThumbnailPath } = useFileMeta(
      props,
      context
    )
    return { fileThumbnailPath, styles, fileLink, fileMeta }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 240px;
  height: 160px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: {
    width: 2px;
    style: solid;
  }
  img {
    cursor: pointer;
  }
}
.largeContainer {
  border-radius: 6px;
  overflow: hidden;
  border: {
    width: 2px;
    style: solid;
  }
  max-width: min(600px, 100%);
  img {
    max-width: 100%;
    max-height: 450px;
    cursor: pointer;
  }
}
</style>
