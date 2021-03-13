<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <message-file-list-item-content :file-id="fileId" />
    </div>
    <chrome-audio :file-id="fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import MessageFileListItemContent from './MessageFileListItemContent.vue'
import ChromeAudio from '@/components/UI/ChromeAudio.vue'

export default defineComponent({
  name: 'MessageFileListVideo',
  components: {
    MessageFileListItemContent,
    ChromeAudio
  },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const { fileMeta, fileLink, fileRawPath } = useFileMeta(props)
    return { fileMeta, fileLink, fileRawPath }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
  max-width: min(400px, 100%);
  height: max-content;
  border: {
    width: 2px;
    style: solid;
    radius: 6px;
    color: $theme-ui-secondary;
  }
}
.description {
  width: 100%;
  margin: 6px 0;
  cursor: pointer;
}
</style>
