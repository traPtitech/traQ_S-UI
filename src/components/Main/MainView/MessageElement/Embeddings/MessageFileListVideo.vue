<template>
  <div
    v-if="canShow"
    ref="container"
    :class="[
      $style.container,
      isLoaded || $style.unload,
      (!hasPlayed || !isLoaded) && $style.thumbnail
    ]"
  >
    <div :class="$style.overlay">
      <MessageFileListItemContent :file-id="fileId" is-white />
    </div>
    <video
      ref="video"
      controls
      controlslist="nodownload"
      preload="none"
      draggable="false"
      :src="fileRawPath"
      :poster="filePosterPath"
      @canplay="onCanPlay"
      @play="onPlay"
    />
  </div>
  <div v-else :class="$style.error">表示できない動画です</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import useFileMeta from '/@/composables/files/useFileMeta'
import type { ChannelId, DMChannelId, FileId } from '/@/types/entity-ids'

import MessageFileListItemContent from './MessageFileListItemContent.vue'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId | DMChannelId
    fileId?: FileId
  }>(),
  {
    fileId: ''
  }
)

const { fileRawPath, filePosterPath, canShow } = useFileMeta(props)
const container = ref<HTMLDivElement>()
const isLoaded = ref(false)
const hasPlayed = ref(false)
const onCanPlay = () => {
  if (!container.value) return
  isLoaded.value = true
}
const onPlay = () => {
  hasPlayed.value = true
}
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
    width: clamp(100px, 100%, 600px);
    height: auto;
    max-height: 450px;
    object-fit: contain;
    margin: auto;
  }
}

.thumbnail {
  box-sizing: content-box;
  max-width: min(360px, calc(100% - 4px));

  video {
    width: 100%;
    max-width: 360px;
    height: auto;
  }
}

.unload {
  min-width: min(300px, 100%);
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
