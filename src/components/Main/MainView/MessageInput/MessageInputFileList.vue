<template>
  <div v-if="attachments.length > 0" :class="$style.container">
    <message-input-file-list-item
      v-for="(attachment, i) in attachments"
      :key="i"
      :attachment="attachment"
      :class="$style.element"
      @item-remove="removeAttachmentAt(i)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from 'vue'
import MessageInputFileListItem from './MessageInputFileListItem.vue'
import {
  useMessageInputStateAttachment,
  VirtualChannelId
} from '@/providers/messageInputState'
import { ChannelId } from '@/types/entity-ids'
import useToastStore from '@/providers/toastStore'

export default defineComponent({
  name: 'MessageInputFileList',
  components: {
    MessageInputFileListItem
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId | VirtualChannelId>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()
    const { attachments, removeAttachmentAt } = useMessageInputStateAttachment(
      toRef(props, 'channelId'),
      addErrorToast
    )
    return { attachments, removeAttachmentAt }
  }
})
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
