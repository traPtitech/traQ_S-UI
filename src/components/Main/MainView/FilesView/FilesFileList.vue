<template>
  <div :class="$style.container">
    <files-file-list-image :class="$style.fileList" />
    <!-- v-for="meta in fileMetaDataState.images"
      :key="meta.id"
      :file-id="meta.id"
      :is-large="showLargeImage"
      :class="$style.imageItem"
    /> -->
    <!-- <files-file-list-video
      v-for="meta in fileMetaDataState.videos"
      :key="meta.id"
      :file-id="meta.id"
    />
    <files-file-list-audio
      v-for="meta in fileMetaDataState.audios"
      :key="meta.id"
      :file-id="meta.id"
    />
    <files-file-list-file
      v-for="meta in fileMetaDataState.files"
      :key="meta.id"
      :class="$style.item"
      :file-id="meta.id"
    /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilesFileListImage from './FilesFileListImage.vue'
// import FilesFileListVideo from './FilesFileListVideo.vue'
// import FilesFileListAudio from './FilesFileListAudio.vue'
// import FilesFileListFile from './FilesFileListFile.vue'

export default defineComponent({
  name: 'FilesFileList',
  components: {
    FilesFileListImage
    // FilesFileListVideo,
    // FilesFileListAudio,
    // FilesFileListFile
  }
})
</script>
<style lang="scss" module>
.container {
  .fileList {
  }
}
</style>
