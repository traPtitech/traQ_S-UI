<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <messages-scroller
      ref="scrollerEle"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      without-separator
      @request-load-former="onLoadFormerMessagesRequest"
    />
    <files-view-file-list
      v-for="fileList in fileLists"
      :key="fileList.id"
      :class="$style.list"
      :file-id="fileList"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import { ChannelId, FileId } from '@/types/entity-ids'
import { FileInfo } from '@traptitech/traq'
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
    const fileLists = ref(new Set<FileId>())
    apis.getFiles(props.channelId).then(res => {
      fileLists.value = new Set(res.data.map(c => c.id))
    })

    return { fileLists }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
}
</style>
