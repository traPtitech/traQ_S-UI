<template>
  <div
    :class="$style.body"
    ref="bodyRef"
    v-if="state.message"
    :data-is-mobile="isMobile"
    :data-is-entry="isEntryMessage"
  >
    <clip-tools :class="$style.tools" :message-id="messageId" />
    <message-contents
      :class="$style.messageContents"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
    <div :class="$style.footer">
      <span :class="$style.description">
        {{ state.channelPath }} - {{ state.date }}
      </span>
      <router-link :class="$style.link" :to="`/messages/${state.message.id}`">
        メッセージへ
      </router-link>
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
import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from './use/embeddings'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import ClipTools from '@/components/Main/MainView/MessageElement/ClipTools.vue'
import { getCreatedDate } from '@/lib/date'
import useChannelPath from '@/use/channelPath'

export default defineComponent({
  name: 'ClipElement',
  components: {
    MessageContents,
    MessagePinned,
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
    }
  },
  setup(props, context) {
    const bodyRef = ref<HTMLDivElement>(null)
    const { isMobile } = useIsMobile()
    const { channelIdToPathString } = useChannelPath()
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      channelPath: computed((): string =>
        state.message
          ? channelIdToPathString(state.message.channelId, true)
          : ''
      ),
      date: computed((): string =>
        state.message ? getCreatedDate(state.message.createdAt) : ''
      ),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      )
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    return {
      state,
      bodyRef,
      embeddingsState,
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;
$messagePaddingMobile: 16px;

.body {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px $messagePadding;
  &[data-is-mobile='true'] {
    padding: 8px $messagePaddingMobile;
  }
  &[data-is-entry] {
    // TODO: 色を正しくする
    background: $common-background-pin;
  }
  &:not([data-is-entry]):hover {
    // TODO: 色を正しくする
    background: $theme-background-secondary;
  }
}

.messageContents {
  grid-area: message-contents;
  min-width: 0;
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

.footer {
  @include color-ui-secondary;
  grid-area: footer;
  padding-left: 8px;
  font-size: 0.875rem;
  align-self: end;
  margin-top: 4px;
  margin-left: 42px;
  word-break: keep-all;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}

.description {
  font-weight: normal;
  margin-right: 8px;
}
.link {
  font-weight: bold;
}
</style>
