<template>
  <div :class="$style.container">
    <router-link :to="fileLink">
      <files-view-file-list-content-image
        :class="$style.contentImage"
        :file-id="fileId"
      />
      <files-view-file-list-description
        :class="$style.description"
        :file-id="fileId"
      />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FilesViewFileListContentImage from './FilesViewFileListContentImage.vue'
import FilesViewFileListDescription from './FilesViewFileListDescription.vue'
export default defineComponent({
  name: 'FilesFileListImage',
  components: {
    FilesViewFileListDescription,
    FilesViewFileListContentImage
  },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const {
      fileMeta,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize
    } = useFileMeta(props, context)
    return {
      fileMeta,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize
    }
  }
})
</script>

<style lang="scss" module>
.container {
  overflow: hidden;
  position: relative;
  width: 50%;
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
  border: {
    style: solid;
    width: 2x;
    radius: 4px;
    color: $theme-background-secondary;
  }
  .contentImage {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .description {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    border-top: {
      style: solid;
      width: 2px;
      color: $theme-background-secondary;
    }
  }
}
</style>
