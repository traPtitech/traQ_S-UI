<template>
    <img :alt="fileMeta.name" :src="fileThumbnailPath" :class="$style.image" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
export default defineComponent({
  name: 'FilesFileListContentImage',
  components: {},
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

<style lang="scss" module>
.image {
  width: 100%;
  object-fit: cover;
}
</style>
