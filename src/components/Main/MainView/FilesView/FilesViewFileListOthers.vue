<template>
  <div>
    <router-link :to="fileLink">
      <files-view-file-list-content-others :file-id="fileId" />
      <files-view-file-list-description :file-id="fileId" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FilesViewFileListContentOthers from './FilesViewFileListContentOthers.vue'
import FilesViewFileListDescription from './FilesViewFileListDescription.vue'
export default defineComponent({
  name: 'FilesFileListFile',
  components: {
    FilesViewFileListContentOthers,
    FilesViewFileListDescription
  },
  props: {
    fileId: {
      type: String,
      required: true
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

<style lang="scss" module></style>
