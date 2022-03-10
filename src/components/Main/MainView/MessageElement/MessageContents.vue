<template>
  <div :class="$style.container">
    <user-icon
      :class="$style.userIcon"
      :user-id="state.message.userId"
      :size="40"
    />
    <message-header
      :class="$style.messageHeader"
      :user-id="state.message.userId"
      :created-at="state.message.createdAt"
      :updated-at="state.message.updatedAt"
    />
    <div :class="$style.messageContents">
      <message-markdown v-show="!state.isEditing" :message-id="messageId" />
      <message-editor
        v-if="state.isEditing"
        :raw-content="state.rawContent"
        :message-id="messageId"
        :channel-id="state.message.channelId"
      />
      <message-quote-list
        v-if="embeddingsState.quoteMessageIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :parent-message-channel-id="state.message.channelId"
        :message-ids="embeddingsState.quoteMessageIds"
      />
      <message-file-list
        v-if="embeddingsState.fileIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :channel-id="state.message.channelId"
        :file-ids="embeddingsState.fileIds"
      />
      <message-ogp-list
        v-if="embeddingsState.externalUrls.length > 0"
        :external-urls="embeddingsState.externalUrls"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, PropType } from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import UserIcon from '/@/components/UI/UserIcon.vue'
import MessageMarkdown from '/@/components/UI/MessageMarkdown.vue'
import MessageHeader from './MessageHeader.vue'
import MessageEditor from './MessageEditor.vue'
import MessageFileList from './MessageFileList.vue'
import MessageQuoteList from './MessageQuoteList.vue'
import MessageOgpList from './MessageOgpList.vue'
import useEmbeddings from '/@/use/message/embeddings'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'

export default defineComponent({
  name: 'MessageContents',
  components: {
    UserIcon,
    MessageHeader,
    MessageMarkdown,
    MessageEditor,
    MessageFileList,
    MessageQuoteList,
    MessageOgpList
  },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isEntryMessage: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { editingMessageId } = useMessagesView()
    const { isMobile } = useResponsiveStore()
    const { messagesMap } = useMessagesStore()

    const state = reactive({
      message: computed(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        () => messagesMap.value.get(props.messageId)!
      ),
      rawContent: computed((): string => state.message.content ?? ''),
      isEditing: computed(() => props.messageId === editingMessageId.value),
      stampDetailFoldingState: false
    })

    const { embeddingsState } = useEmbeddings(props)

    return {
      state,
      embeddingsState,
      isMobile
    }
  }
})
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
