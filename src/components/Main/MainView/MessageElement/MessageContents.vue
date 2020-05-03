<template>
  <div class="$style.container">
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
    <component
      :is="toolTipComponent"
      :class="$style.tools"
      :message-id="messageId"
      v-if="isHover"
    />
    <div :class="$style.messageContents">
      <div
        v-show="!state.isEditing"
        :class="['markdown-body', $style.content]"
        v-html="state.content"
      />
      <message-editor
        v-if="state.isEditing"
        :raw-content="state.rawContent"
        :message-id="messageId"
      />
      <message-quote-list
        v-if="embeddingsState.quoteMessageIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :message-ids="embeddingsState.quoteMessageIds"
      />
      <message-file-list
        v-if="embeddingsState.fileIds.length > 0"
        :class="$style.messageEmbeddingsList"
        :file-ids="embeddingsState.fileIds"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import useIsMobile from '@/use/isMobile'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageEditor from './MessageEditor.vue'
import MessageFileList from './MessageFileList.vue'
import MessageQuoteList from './MessageQuoteList.vue'
import useEmbeddings from './use/embeddings'
import MessageTools from './MessageTools.vue'
import ClipTools from './ClipTools.vue'

export default defineComponent({
  name: 'MessageContent',
  components: {
    UserIcon,
    MessageHeader,
    MessageEditor,
    MessageFileList,
    MessageQuoteList,
    MessageTools,
    ClipTools
  },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isEntryMessage: {
      type: Boolean,
      default: false
    },
    messageType: {
      type: String,
      default: 'defaultMessage'
    },
    isHover: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const { isMobile } = useIsMobile()
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      ),
      rawContent: computed(
        () => store.state.entities.messages[props.messageId]?.content ?? ''
      ),
      isEditing: computed(
        () =>
          props.messageId === store.state.domain.messagesView.editingMessageId
      ),
      stampDetailFoldingState: false
    })

    const toolTipComponent = computed(() => props.messageType === 'clipMessage' ? ClipTools : MessageTools)

    const { embeddingsState } = useEmbeddings(props)

    return {
      state,
      embeddingsState,
      isMobile,
      toolTipComponent
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;
$messagePaddingMobile: 16px;

.container {
  display: contents;
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

.content {
  grid-area: message-contents;
  word-break: break-word;
  word-wrap: break-word;
  line-break: loose;
}

.messageEmbeddingsList {
  margin-top: 16px;
}

.tools {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 1;
}
</style>
