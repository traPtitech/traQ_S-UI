<template>
  <div :class="$style.container">
    <UserIcon :class="$style.userIcon" :user-id="message.userId" :size="40" />
    <MessageHeader
      :class="$style.messageHeader"
      :user-id="message.userId"
      :created-at="message.createdAt"
      :updated-at="message.updatedAt"
    />
    <div :class="$style.messageContents">
      <MarkdownContent v-show="!isEditing" :content="renderedContent" />
      <MessageEditor
        v-if="isEditing"
        :raw-content="message.content"
        :message-id="messageId"
        :channel-id="message.channelId"
        @finish-editing="finishEditing"
      />
      <MessageQuoteList
        v-if="embeddingsState.quoteMessageIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :parent-message-channel-id="message.channelId"
        :message-ids="embeddingsState.quoteMessageIds"
      />
      <MessageFileList
        v-if="embeddingsState.fileIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :channel-id="message.channelId"
        :file-ids="embeddingsState.fileIds"
      />
      <MessageOgpList
        v-if="embeddingsState.externalUrls.length > 0"
        :external-urls="embeddingsState.externalUrls"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'
import { useMessageEditingStateStore } from '/@/store/ui/messageEditingStateStore'
import type { MessageId } from '/@/types/entity-ids'

import MessageEditor from './MessageEditor.vue'
import MessageFileList from './MessageFileList.vue'
import MessageHeader from './MessageHeader.vue'
import MessageOgpList from './MessageOgpList.vue'
import MessageQuoteList from './MessageQuoteList.vue'

const props = defineProps<{
  messageId: MessageId
}>()

const { messagesMap } = useMessagesStore()
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const message = computed(() => messagesMap.value.get(props.messageId)!)

const { editingMessageId } = useMessageEditingStateStore()
const isEditing = computed(() => props.messageId === editingMessageId.value)
const finishEditing = () => {
  editingMessageId.value = undefined
}

const { renderedContentMap } = useMessagesView()
const renderedContent = computed(
  () => renderedContentMap.value.get(props.messageId) ?? ''
)

const { embeddingsState } = useEmbeddings(props)
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'user-icon message-header'
    'user-icon message-contents'
    '......... message-contents';
  grid-template-rows: 20px auto 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
}

.userIcon {
  grid-area: user-icon;
  margin-top: 2px;
}

.messageHeader {
  grid-area: message-header;
  padding-left: 8px;
}

.messageContents {
  grid-area: message-contents;
  padding-top: 4px;
  padding-left: 8px;
  min-width: 0;
}

.messageEmbeddingsList {
  margin-top: 16px;
}
</style>
