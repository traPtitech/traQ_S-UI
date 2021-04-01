<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <div
      v-for="fileList in fileLists"
      :key="fileList.id"
      :class="$style.list"
    >
      {{ fileList.id }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import { FileInfo } from '@traptitech/traq'
import apis from '@/lib/apis'
import ScrollLoadingBar from '../ScrollLoadingBar.vue'
// import FilesViewFileList from './FilesViewFileList.vue'
import useFileMeta from '@/use/fileMeta'
export default defineComponent({
  name: 'FilesView',
  components: {
    ScrollLoadingBar,
    // FilesViewFileList
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const fileLists = ref(new Set<FileInfo>())
    apis.getFiles(props.channelId).then(res => {
      fileLists.value = new Set(res.data)
    })
    console.log(fileLists)
    return { fileLists }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
}

</style>
