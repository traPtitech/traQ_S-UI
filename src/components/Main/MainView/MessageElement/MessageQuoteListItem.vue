<template>
  <div v-if="state.shouldShow" :class="$style.body" data-is-shown>
    <user-icon
      :class="$style.userIcon"
      :user-id="state.message.userId"
      :size="24"
      prevent-modal
    />
    <message-quote-list-item-header
      :class="$style.messageHeader"
      :user-id="state.message.userId"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
    </div>
    <message-quote-list-item-footer
      :class="$style.footer"
      :message="state.message"
    />
  </div>
  <div v-else :class="$style.body">
    存在しないか表示できないメッセージの引用です
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, PropType } from 'vue'
import store from '/@/store'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { MessageId, ChannelId, DMChannelId } from '/@/types/entity-ids'
import MessageQuoteListItemHeader from './MessageQuoteListItemHeader.vue'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'

export default defineComponent({
  name: 'MessageQuoteListItem',
  components: {
    UserIcon,
    MessageQuoteListItemHeader,
    MessageQuoteListItemFooter
  },
  props: {
    parentMessageChannelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    },
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props) {
    const state = reactive({
      message: computed(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          store.state.entities.messages.messagesMap.get(props.messageId)!
      ),
      shouldShow: computed(
        (): boolean =>
          !!state.message &&
          // DMのメッセージは同じDMチャンネルから引用されてる場合だけ表示する
          (!store.state.entities.dmChannelsMap.has(state.message.channelId) ||
            state.message.channelId === props.parentMessageChannelId)
      ),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap.get(
            props.messageId
          ) ?? ''
      )
    })
    return { state }
  }
})
</script>

<style lang="scss" module>
.body {
  width: 100%;
  min-width: 0;
  padding: {
    left: 16px;
  }
  border: {
    left-width: 4px;
    left-style: solid;
    color: $theme-ui-tertiary;
  }
  overflow: hidden;
  &[data-is-shown] {
    display: grid;
    grid-template-areas:
      'user-icon message-header'
      'user-icon message-contents'
      '......... message-contents'
      '......... footer';
    grid-template-rows: 24px 1fr 1fr auto;
    grid-template-columns: 24px 1fr;
  }
  &:not([data-is-shown]) {
    @include color-text-secondary;
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
  @include size-body2;
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

.footer {
  grid-area: footer;
  margin-top: 4px;
}
</style>
