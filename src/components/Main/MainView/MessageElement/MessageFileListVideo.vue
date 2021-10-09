<template>
  <div :class="$style.container">
    <div :class="$style.overlay">
      <message-file-list-item-content :file-id="fileId" is-white />
    </div>
    <video
      controls
      controlsList="nodownload"
      preload="none"
      draggable="false"
      :alt="fileMeta?.name"
      :src="fileRawPath"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '/@/use/fileMeta'
import MessageFileListItemContent from './MessageFileListItemContent.vue'

export default defineComponent({
  name: 'MessageFileListVideo',
  components: { MessageFileListItemContent },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { fileMeta, fileLink, fileRawPath } = useFileMeta(props)
    return { fileMeta, fileLink, fileRawPath }
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
    color: $theme-ui-secondary;
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
  background: $common-background-overlay;
  cursor: pointer;
  z-index: $z-index-message-attachment-video-overlay;
  backdrop-filter: blur(0px);
  opacity: 0;
  transition: all 0.2s ease;

  .container:hover & {
    backdrop-filter: blur(4px);
    opacity: 1;
  }
}
</style>
