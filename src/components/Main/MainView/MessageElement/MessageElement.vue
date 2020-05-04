<template>
  <div
    :class="$style.body"
    ref="bodyRef"
    v-if="state.message"
    :data-is-mobile="isMobile"
    :data-is-pinned="state.isPinned"
    :data-is-entry="isEntryMessage"
    :data-is-editing="state.isEditing"
  >
    <message-pinned
      :message-id="messageId"
      v-if="state.message.pinned"
      :class="$style.pinned"
    />
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
    <message-tools :class="$style.tools" :message-id="messageId" />
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
      <div :class="$style.stampWrapper">
        <icon
          name="rounded-triangle"
          :size="20"
          v-if="state.message.stamps.length > 0"
          :class="$style.toggleButton"
          :data-is-open="state.stampDetailFoldingState"
          @click="onStampDetailFoldingToggle"
        />
        <message-stamp-list
          :class="$style.stamps"
          v-if="state.message.stamps.length > 0"
          :message-id="messageId"
          :stamps="state.message.stamps"
          :is-show-detail="state.stampDetailFoldingState"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import useIsMobile from '@/use/isMobile'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageEditor from './MessageEditor.vue'
import MessageStampList from './MessageStampList.vue'
import MessageFileList from './MessageFileList.vue'
import MessageQuoteList from './MessageQuoteList.vue'
import useElementRenderObserver from './use/elementRenderObserver'
import MessageTools from './MessageTools.vue'
import useEmbeddings from './use/embeddings'
import Icon from '@/components/UI/Icon.vue'
import MessagePinned from './MessagePinned.vue'

export default defineComponent({
  name: 'MessageElement',
  components: {
    UserIcon,
    MessageHeader,
    MessageEditor,
    MessageStampList,
    MessageFileList,
    MessageQuoteList,
    Icon,
    MessageTools,
    MessagePinned
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
  setup(props, context) {
    const bodyRef = ref<HTMLDivElement>(null)
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
      isPinned: computed((): boolean => state.message?.pinned ?? false),
      stampDetailFoldingState: false
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    const onStampDetailFoldingToggle = () => {
      state.stampDetailFoldingState = !state.stampDetailFoldingState
    }

    return {
      state,
      bodyRef,
      embeddingsState,
      isMobile,
      onStampDetailFoldingToggle
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;
$messagePaddingMobile: 16px;

.body {
  position: relative;
  display: grid;
  grid-template:
    'pinned pinned'
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: auto 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px $messagePadding;
  &[data-is-mobile='true'] {
    padding: 8px $messagePaddingMobile;
  }
  &[data-is-pinned] {
    background: $common-background-pin;
  }
  &[data-is-entry] {
    // TODO: 色を正しくする
    background: $common-background-pin;
  }
  &:not([data-is-editing]):not([data-is-pinned]):not([data-is-entry]):hover {
    // TODO: 色を正しくする
    background: $theme-background-secondary;
  }
}

.pinned {
  grid-area: pinned;
  height: 28px;
  padding: {
    top: 4px;
    bottom: 8px;
  }
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

.stampWrapper {
  margin-top: 8px;
  position: relative;
}

.toggleButton {
  color: transparent;
  &[data-is-open] {
    transform: rotate(0.5turn);
  }
  .body:hover & {
    @include color-ui-secondary;
  }
  opacity: 0;
  position: absolute;
  left: -26px;
  top: 2px;
  cursor: pointer;
}

.messageEmbeddingsList {
  margin-top: 16px;
}

.tools {
  .body:not(:hover) & {
    display: none;
  }
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 1;
}
</style>
