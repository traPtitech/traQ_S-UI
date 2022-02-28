<template>
  <div :class="$style.container">
    <message-file-list-item-content v-if="canShow" :file-id="fileId" />
    <div v-else :class="$style.error">表示できないファイルです</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { FileId, ChannelId, DMChannelId } from '/@/types/entity-ids'
import MessageFileListItemContent from './MessageFileListItemContent.vue'
import useFileMeta from '/@/use/fileMeta'

export default defineComponent({
  name: 'MessageFileListFile',
  components: { MessageFileListItemContent },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    },
    fileId: {
      type: String as PropType<FileId>,
      default: ''
    }
  },
  setup(props) {
    const { canShow } = useFileMeta(props)
    return { canShow }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  max-width: 400px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
    color: $theme-ui-secondary-default;
  }
  overflow: hidden;
  cursor: pointer;
}

.error {
  padding: 16px 32px;
}
</style>
