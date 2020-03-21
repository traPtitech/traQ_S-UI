<template>
  <div :class="$style.body">
    <user-icon :class="$style.userIcon" :userId="state.message.userId" />
    <message-header
      :class="$style.messageHeader"
      :userId="state.message.userId"
    />
    <div :class="$style.messageContents">
      <div :class="$style.content" v-html="state.content" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'

interface Props {
  messageId: string
}

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader },
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
}

.messageDetails {
  grid-area: message-header;
}

.messageContents {
  grid-area: message-contents;
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
</style>
