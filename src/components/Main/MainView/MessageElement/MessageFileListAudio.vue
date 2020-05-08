<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <message-file-list-item-content :file-id="fileId" />
    </div>
    <audio
      controls
      preload="none"
      draggable="false"
      :alt="fileMeta.name"
      :src="fileRawPath"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useFileMeta from '@/use/fileMeta'
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
  setup(props, context) {
    const { fileMeta, fileLink, fileRawPath } = useFileMeta(props, context)
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
  audio {
    display: block;
    max-width: 100%;
    max-height: 450px;
    &::-webkit-media-controls-enclosure {
      border-radius: 0;
    }
  }
}
.description {
  width: 100%;
  margin: 6px 0;
  cursor: pointer;
}
</style>
