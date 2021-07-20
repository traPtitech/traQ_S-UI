<template>
  <div :class="$style.container">
    <div v-if="fileMetaDataState.images.length > 0" :class="$style.list">
      <search-result-message-image
        v-for="image in fileMetaDataState.images"
        :key="image.id"
        :file-id="image.id"
      />
    </div>
    <div v-if="files.length > 0" :class="$style.list">
      <search-result-message-file
        v-for="file in files"
        :key="file.id"
        :file-id="file.id"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import useFileMetaList from '/@/use/message/fileMetaList'
import { FileId } from '/@/types/entity-ids'
import SearchResultMessageImage from './SearchResultMessageImage.vue'
import SearchResultMessageFile from './SearchResultMessageFile.vue'

export default defineComponent({
  name: 'SearchResultMessageFileList',
  components: { SearchResultMessageImage, SearchResultMessageFile },
  props: {
    fileIds: {
      type: Array as PropType<FileId[]>,
      default: () => []
    }
  },
  setup(props) {
    const { fileMetaDataState } = useFileMetaList(props)
    const files = computed(() =>
      [
        fileMetaDataState.audios,
        fileMetaDataState.videos,
        fileMetaDataState.files
      ].flat()
    )
    return { fileMetaDataState, files }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-auto-flow: row;
  row-gap: 0.5rem;
}
.list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  column-gap: 1rem;
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    black calc(100% - 32px),
    transparent 100%
  );
}
</style>
