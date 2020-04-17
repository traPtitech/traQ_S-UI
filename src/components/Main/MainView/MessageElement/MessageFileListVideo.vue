<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.overlay" :style="styles.overlay">
      <message-file-list-item-content :file-id="fileId" is-white />
    </div>
    <video controls draggable="false" :alt="fileMeta.name" :src="fileRawPath" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useFileMeta from './use/fileMeta'
import MessageFileListItemContent from './MessageFileListItemContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.background.secondary
    })),
    overlay: makeStyles((_, common) => ({
      background: common.background.overlay
    }))
  })

export default defineComponent({
  name: 'MessageFileListVideo',
  components: { MessageFileListItemContent },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { fileMeta, fileLink, fileRawPath } = useFileMeta(props, context)
    return { styles, fileMeta, fileLink, fileRawPath }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
  max-width: min(600px, 100%);
  width: max-content;
  height: max-content;
  border: {
    width: 2px;
    style: solid;
    radius: 6px;
  }
  video {
    display: block;
    max-width: 100%;
    max-height: 450px;
  }
}
.overlay {
  position: absolute;
  width: 100%;
  background: linear-gradient(to bottom, #000000, transparent);
  backdrop-filter: blur(4px);
  cursor: pointer;
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;

  .container:hover & {
    opacity: 1;
  }
}
</style>
