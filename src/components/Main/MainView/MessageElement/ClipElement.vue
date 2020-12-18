<template>
  <div
    :class="$style.body"
    ref="bodyRef"
    v-if="state.message"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-entry="$boolAttr(isEntryMessage)"
  >
    <message-tools :class="$style.tools" :message-id="messageId" is-minimum />
    <message-contents
      :class="$style.messageContents"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
    <message-quote-list-item-footer
      :class="$style.footer"
      :message="state.message"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, shallowRef, PropType } from 'vue'
import store from '@/_store'
import { MessageId } from '@/types/entity-ids'
import useIsMobile from '@/use/isMobile'
import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from './use/embeddings'
import MessageContents from './MessageContents.vue'
import MessageTools from './MessageTools.vue'
import { getCreatedDate } from '@/lib/date'
import useChannelPath from '@/use/channelPath'
import MessageQuoteListItemFooter from './MessageQuoteListItemFooter.vue'

export default defineComponent({
  name: 'ClipElement',
  components: {
    MessageContents,
    MessageTools,
    MessageQuoteListItemFooter
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
    const bodyRef = shallowRef<HTMLDivElement | null>(null)
    const { isMobile } = useIsMobile()
    const { channelIdToPathString } = useChannelPath()
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      channelPath: computed((): string =>
        state.message
          ? channelIdToPathString(state.message.channelId, false)
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
  &[data-is-mobile] {
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
  z-index: $z-index-message-element-tools;
}

.footer {
  margin-top: 4px;
  margin-left: 42px;
}
</style>
