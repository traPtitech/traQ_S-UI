<template>
  <div>
    <files-file-list-content-others />
    <files-file-list-description />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilesFileListContentOthers from './FilesFileListContentOthers.vue'
import FilesFileListDescription from './FilesFileListDescription.vue'
export default defineComponent({
  name: 'FilesFileListFile',
  components: {
    FilesFileListContentOthers,
    FilesFileListDescription
  }
})
</script>

<style lang="scss" module></style>
