<template>
  <div :class="$style.body" v-if="state.message">
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
    <div :class="$style.footer">
      <span :class="$style.description">
        {{ state.channelPath }} - {{ state.date }}
      </span>
      <router-link :class="$style.link" :to="`/messages/${state.message.id}`"
        >メッセージへ</router-link
      >
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
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageQuoteListItemHeader from './MessageQuoteListItemHeader.vue'
import { MessageId } from '@/types/entity-ids'
import { getCreatedDate } from '@/lib/date'
import useChannelPath from '@/use/channelPath'

export default defineComponent({
  name: 'MessageQuoteListItem',
  components: { UserIcon, MessageQuoteListItemHeader },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToPathString } = useChannelPath()
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      channelPath: computed((): string =>
        state.message
          ? channelIdToPathString(state.message.channelId, true)
          : ''
      ),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      ),
      date: computed((): string =>
        state.message ? getCreatedDate(state.message.createdAt) : ''
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
    '......... message-contents'
    '......... footer';
  grid-template-rows: 24px 1fr 1fr auto;
  grid-template-columns: 24px 1fr;
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
  @include color-ui-secondary;
  @include size-body2;
  grid-area: footer;
  padding-left: 8px;
  align-self: end;
  margin-top: 4px;
  word-break: keep-all;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  min-width: 0;
}
.description {
  font-weight: normal;
  margin-right: 8px;
}
.link {
  font-weight: bold;
}
</style>
