<template>
  <div class="$style.content">
    <file-type-icon :type="fileType" :size="36" class="$style.icon" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileTypeIcon from '@/components/UI/FileTypeIcon.vue'
export default defineComponent({
  name: 'FilesFileListContentOthers',
  components: { FileTypeIcon },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    const fileIdState = reactive({
      fileId: computed(() => props.fileId)
    })
    const {
      fileType,
      fileMeta,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize
    } = useFileMeta(fileIdState, context)
    return {
      fileType,
      fileMeta,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize
    }
  }
})
</script>

<style lang="scss" module>
.icon {
  padding: 100px;
}
</style>
