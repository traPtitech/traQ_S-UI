<template>
  <div>
    <div :class="$style.imageContainer">
      <message-file-list-image
        v-for="meta in fileMetaDataState.images"
        :key="meta.id"
        :channel-id="channelId"
        :file-id="meta.id"
        :is-large="showLargeImage"
        :class="$style.imageItem"
      />
    </div>
    <message-file-list-video
      v-for="meta in fileMetaDataState.videos"
      :key="meta.id"
      :channel-id="channelId"
      :file-id="meta.id"
    />
    <message-file-list-audio
      v-for="meta in fileMetaDataState.audios"
      :key="meta.id"
      :channel-id="channelId"
      :file-id="meta.id"
    />
    <message-file-list-file
      v-for="meta in fileMetaDataState.files"
      :key="meta.id"
      :class="$style.item"
      :channel-id="channelId"
      :file-id="meta.id"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ChannelId, DMChannelId, FileId } from '/@/types/entity-ids'
import useFileMetaList from '/@/composables/message/useFileMetaList'
import MessageFileListImage from './MessageFileListImage.vue'
import MessageFileListVideo from './MessageFileListVideo.vue'
import MessageFileListAudio from './MessageFileListAudio.vue'
import MessageFileListFile from './MessageFileListFile.vue'

export default defineComponent({
  name: 'MessageFileList',
  components: {
    MessageFileListImage,
    MessageFileListVideo,
    MessageFileListAudio,
    MessageFileListFile
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    },
    fileIds: {
      type: Array as PropType<FileId[]>,
      default: () => []
    }
  },
  setup(props) {
    const { fileMetaDataState } = useFileMetaList(props)
    const showLargeImage = computed(() => fileMetaDataState.images.length === 1)
    return { fileMetaDataState, showLargeImage }
  }
})
</script>

<style lang="scss" module>
.imageContainer {
  display: flex;
  flex-flow: row wrap;
}
.imageItem {
  flex-shrink: 0;
  margin-bottom: 16px;
  &:not(:last-child) {
    margin-right: 16px;
  }
}
.item {
  flex-shrink: 0;
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
