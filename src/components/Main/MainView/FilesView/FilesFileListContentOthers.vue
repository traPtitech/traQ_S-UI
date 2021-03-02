<template>
  <!-- <router-link :to="fileLink">
    <img
    alt="fileMeta.name"
    :src="fileThumbnailPath"
    :class="$style.image"
  />
  </router-link> -->
  <div class="$style.content">
  <file-type-icon type="file" :size="36" class="$style.icon" />
  </div>
  <!-- <img
    src="https://q.trap.jp/api/v3/public/icon/hosshii"
    :class="$style.image"
  /> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileTypeIcon from '@/components/UI/FileTypeIcon.vue'
export default defineComponent({
  name: 'FilesFileListContentOthers',
  components: {FileTypeIcon},
  data: () => {
    return {
      fileLink: 'https://q.trap.jp/api/v3/public/icon/hosshii',
      fileThumbnailPath: 'https://q.trap.jp/api/v3/public/icon/hosshii'
    }
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  // setup(props, context) {
  //   const {
  //     fileMeta,
  //     fileLink,
  //     fileThumbnailPath,
  //     fileThumbnailSize
  //   } = useFileMeta(props, context)

  //   return {
  //     fileMeta,
  //     fileLink,
  //     fileThumbnailPath,
  //     fileThumbnailSize
  //   }
  // }
})
</script>

<style lang="scss" module>
.icon {
  padding: 100px;
}
</style>
