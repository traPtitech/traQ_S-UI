<template>
  <div>
    <files-view-file-list-image v-if="fileType === 'image'" :file-id="fileId" />
    <files-view-file-list-others v-else :file-id="fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, reactive } from 'vue'
import { FileId } from '@/types/entity-ids'
import useFileMeta from '@/use/fileMeta'
import FilesViewFileListImage from './FilesViewFileListImage.vue'
import FilesViewFileListOthers from './FilesViewFileListOthers.vue'
export default defineComponent({
  name: 'MessageFileList',
  components: {
    FilesViewFileListImage,
    FilesViewFileListOthers
  },
  props: {
    fileId: {
      type: String as PropType<FileId>,
      required: true
    }
  },
  setup(props, context) {
    const fileIdState = reactive({
      fileId: computed(() => props.fileId)
    })
    const { fileMeta, fileType } = useFileMeta(fileIdState, context)
    console.log(fileMeta, fileType)
    return { fileMeta, fileType }
  }
})
</script>

<style lang="scss" module></style>
