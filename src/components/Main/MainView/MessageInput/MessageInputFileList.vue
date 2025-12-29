<template>
  <div v-if="attachments.length > 0" :class="$style.container">
    <MessageInputFileListItem
      v-for="(attachment, i) in attachments"
      :key="i"
      :attachment="attachment"
      :class="$style.element"
      @item-remove="removeAttachmentAt(i)"
    />
  </div>
</template>

<script lang="ts" setup>
import { toRef } from 'vue'

import useMessageInputStateAttachment from '/@/composables/messageInputState/useMessageInputStateAttachment'
import type { VirtualChannelId } from '/@/store/ui/messageInputStateStore'
import { useToastStore } from '/@/store/ui/toast'
import type { ChannelId } from '/@/types/entity-ids'

import MessageInputFileListItem from './MessageInputFileListItem.vue'

const props = defineProps<{
  channelId: ChannelId | VirtualChannelId
}>()

const { addErrorToast } = useToastStore()
const { attachments, removeAttachmentAt } = useMessageInputStateAttachment(
  toRef(props, 'channelId'),
  addErrorToast
)
</script>

<style lang="scss" module>
.container {
  width: 100%;
  display: flex;
  padding-top: 4px;
  padding-bottom: 6px;
  overflow-x: scroll;
}
.element {
  margin: 0 8px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}
</style>
