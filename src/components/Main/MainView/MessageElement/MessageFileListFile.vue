<template>
  <div :class="$style.container">
    <message-file-list-item-content v-if="canShow" :file-id="fileId" />
    <div v-else :class="$style.error">表示できないファイルです</div>
  </div>
</template>

<script lang="ts" setup>
import MessageFileListItemContent from './MessageFileListItemContent.vue';
import { FileId, ChannelId, DMChannelId } from '/@/types/entity-ids'
import useFileMeta from '/@/composables/useFileMeta'

const props = withDefaults(defineProps<{
    channelId: ChannelId | DMChannelId,
    fileId?: FileId
}>(), {
    fileId: ''
});

const { canShow } = useFileMeta(props)
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
