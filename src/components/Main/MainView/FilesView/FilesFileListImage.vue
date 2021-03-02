<template>
  <div :class="$style.container">
    <files-file-list-content-image :class="$style.contentImage" />
    <files-file-list-description :class="$style.description" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilesFileListContentImage from './FilesFileListContentImage.vue'
import FilesFileListDescription from './FilesFileListDescription.vue'
export default defineComponent({
  name: 'FilesFileListImage',
  components: {
    FilesFileListDescription,
    FilesFileListContentImage
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
