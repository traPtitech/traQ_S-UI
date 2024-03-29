<template>
  <div :class="$style.container">
    <user-icon :class="$style.userIcon" :user-id="message.userId" :size="40" />
    <message-header
      :class="$style.messageHeader"
      :user-id="message.userId"
      :created-at="message.createdAt"
      :updated-at="message.updatedAt"
    />
    <div :class="$style.messageContents">
      <markdown-content v-show="!isEditing" :content="renderedContent" />
      <message-editor
        v-if="isEditing"
        :raw-content="message.content"
        :message-id="messageId"
        :channel-id="message.channelId"
        @finish-editing="finishEditing"
      />
      <message-quote-list
        v-if="embeddingsState.quoteMessageIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :parent-message-channel-id="message.channelId"
        :message-ids="embeddingsState.quoteMessageIds"
      />
      <message-file-list
        v-if="embeddingsState.fileIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :channel-id="message.channelId"
        :file-ids="embeddingsState.fileIds"
      />
      <message-ogp-list
        v-if="embeddingsState.externalUrls.length > 0"
        :external-urls="embeddingsState.externalUrls"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageEditor from './MessageEditor.vue'
import MessageFileList from './MessageFileList.vue'
import MessageQuoteList from './MessageQuoteList.vue'
import MessageOgpList from './MessageOgpList.vue'
import { computed } from 'vue'
import type { MessageId } from '/@/types/entity-ids'
import useEmbeddings from '/@/composables/message/useEmbeddings'
import { useMessagesStore } from '/@/store/entities/messages'
import { useMessageEditingStateStore } from '/@/store/ui/messageEditingStateStore'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import { useMessagesView } from '/@/store/domain/messagesView'

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
