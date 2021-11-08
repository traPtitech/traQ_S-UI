<template>
  <div v-if="canShow" :class="$style.container">
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
  <div v-else :class="$style.error">表示できない動画です</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import useFileMeta from '/@/use/fileMeta'
import MessageFileListItemContent from './MessageFileListItemContent.vue'
import { FileId, ChannelId, DMChannelId } from '/@/types/entity-ids'

export default defineComponent({
  name: 'MessageFileListVideo',
  components: { MessageFileListItemContent },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    },
    fileId: {
      type: String as PropType<FileId>,
      default: ''
    }
  },
  setup(props) {
    const { fileMeta, fileLink, fileRawPath, canShow } = useFileMeta(props)
    return { fileMeta, fileLink, fileRawPath, canShow }
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

.error {
  padding: 16px 32px;
  max-width: min(600px, 100%);
  border: {
    width: 2px;
    style: solid;
    radius: 6px;
    color: $theme-ui-secondary;
  }
}
</style>
