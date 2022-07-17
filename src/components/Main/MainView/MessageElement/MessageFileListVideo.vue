<template>
  <div v-if="canShow" :class="$style.container">
    <div :class="$style.overlay">
      <message-file-list-item-content :file-id="fileId" is-white />
    </div>
    <video
      controls
      controlslist="nodownload"
      preload="none"
      draggable="false"
      :src="fileRawPath"
    />
  </div>
  <div v-else :class="$style.error">表示できない動画です</div>
</template>

<script lang="ts" setup>
import MessageFileListItemContent from './MessageFileListItemContent.vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import type { FileId, ChannelId, DMChannelId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId | DMChannelId
    fileId?: FileId
  }>(),
  {
    fileId: ''
  }
)

const { fileMeta, fileRawPath, canShow } = useFileMeta(props)
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
    color: $theme-ui-secondary-default;
  }
  video {
    display: block;
    max-width: 100%;
    max-height: 450px;
  }
}
.overlay {
  @include background-common-overlay;
  position: absolute;
  width: 100%;
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
    color: $theme-ui-secondary-default;
  }
}
</style>
