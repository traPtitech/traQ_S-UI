<template>
  <div>
    <div :class="$style.imageContainer">
      <MessageFileListImage
        v-for="meta in fileMetaDataState.images"
        :key="meta.id"
        :channel-id="channelId"
        :file-id="meta.id"
        :is-large="showLargeImage"
      />
    </div>
    <MessageFileListVideo
      v-for="meta in fileMetaDataState.videos"
      :key="meta.id"
      :channel-id="channelId"
      :file-id="meta.id"
    />
    <MessageFileListAudio
      v-for="meta in fileMetaDataState.audios"
      :key="meta.id"
      :channel-id="channelId"
      :file-id="meta.id"
    />
    <MessageFileListFile
      v-for="meta in fileMetaDataState.files"
      :key="meta.id"
      :class="$style.item"
      :channel-id="channelId"
      :file-id="meta.id"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import useFileMetaList from '/@/composables/message/useFileMetaList'
import type { ChannelId, DMChannelId, FileId } from '/@/types/entity-ids'

import MessageFileListAudio from './MessageFileListAudio.vue'
import MessageFileListFile from './MessageFileListFile.vue'
import MessageFileListImage from './MessageFileListImage.vue'
import MessageFileListVideo from './MessageFileListVideo.vue'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId | DMChannelId
    fileIds?: FileId[]
  }>(),
  {
    fileIds: () => []
  }
)

const { fileMetaDataState } = useFileMetaList(props)
const showLargeImage = computed(() => fileMetaDataState.images.length === 1)
</script>

<style lang="scss" module>
.imageContainer {
  display: flex;
  flex-flow: row wrap;
  gap: 16px;
}
.item {
  flex-shrink: 0;
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
