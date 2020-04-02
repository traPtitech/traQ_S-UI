<template>
  <div :class="$style.body">
    <user-icon
      :class="$style.userIcon"
      :userId="state.message.userId"
      :size="40"
    />
    <message-header
      :class="$style.messageHeader"
      :userId="state.message.userId"
      :createdAt="state.message.createdAt"
      :updatedAt="state.message.updatedAt"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
      <message-file-list
        v-if="state.fileIds.length > 0"
        :class="$style.messageFileList"
        :fileIds="state.fileIds"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageFileList from './MessageFileList.vue'

interface Props {
  messageId: string
}

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader, MessageFileList },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      ),
      fileIds: computed(() =>
        store.state.domain.messagesView.embeddedFilesMap[props.messageId].map(
          e => e.id
        )
      )
    })

    return { state }
  }
})
</script>

<style lang="scss" module>
.body {
  display: grid;
  grid-template-areas:
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  padding: 8px 0;
  overflow: hidden;
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

  & pre {
    white-space: pre-wrap;
  }
}

.messageFileList {
  margin-top: 16px;
}
</style>
