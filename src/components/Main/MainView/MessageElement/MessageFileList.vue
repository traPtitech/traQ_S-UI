<template>
  <div :class="$style.container">
    <div :class="$style.imageContainer">
      <message-file-list-image
        v-for="meta in fileMetaDataState.images"
        :key="meta.id"
        :fileId="meta.id"
        :fileName="meta.name"
        :is-large="showLargeImage"
        :class="$style.imageItem"
      />
    </div>
    <message-file-list-video
      v-for="meta in fileMetaDataState.videos"
      :key="meta.id"
      :fileId="meta.id"
    />
    <message-file-list-item
      v-for="meta in fileMetaDataState.files"
      :key="meta.id"
      :fileId="meta.id"
      :fileName="meta.name"
      :fileType="parseFileType(meta.mime)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'
import { parseFileType } from '@/lib/util/fileType'
import useFileMetaData from './use/fileMetaData'
import MessageFileListItem from './MessageFileListItem.vue'
import MessageFileListImage from './MessageFileListImage.vue'
import MessageFileListVideo from './MessageFileListVideo.vue'

interface Props {
  fileIds: FileId[]
}

export default defineComponent({
  name: 'MessageFileList',
  components: {
    MessageFileListItem,
    MessageFileListImage,
    MessageFileListVideo
  },
  props: {
    fileIds: {
      type: Array as PropType<FileId[]>,
      default: []
    }
  },
  setup(props: Props) {
    const { fileMetaDataState } = useFileMetaData(props)
    const showLargeImage = computed(() => fileMetaDataState.images.length === 1)
    return { fileMetaDataState, parseFileType, showLargeImage }
  }
})
</script>

<style lang="scss" module>
.container {
}
.imageContainer {
  display: flex;
  flex-flow: row wrap;
  overflow: scroll;
}
.imageItem {
  flex-shrink: 0;
  margin-bottom: 16px;
  max-width: 100%;
  &:not(:last-child) {
    margin-right: 16px;
  }
}
</style>
