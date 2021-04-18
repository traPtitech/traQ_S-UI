<template>
  <div :class="$style.container">
    <files-view-file-list
      v-for="fileId in fileIds"
      :key="fileId"
      :class="$style.list"
      :file-id="fileId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import { ChannelId, FileId } from '@/types/entity-ids'
import store from '@/store'
import apis from '@/lib/apis'
import FilesViewFileList from './FilesViewFileList.vue'
export default defineComponent({
  name: 'FilesView',
  components: {
    FilesViewFileList
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const fileIds = ref(new Set<FileId>())
    apis.getFiles(props.channelId).then(res => {
      fileIds.value = new Set(res.data.map(c => c.id))
    })
    console.log(fileIds)

    const renderFileFromIds = async (fileIds: FileId[]) => {
      await Promise.all(
        fileIds.map(fileId =>
          store.dispatch.entities.messages.fetchFileMetaData({
            fileId
          })
        )
      )
    }
    return { fileIds, renderFileFromIds }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
}
</style>
