<template>
  <div
    :class="$style.body"
    :style="styles.body"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    ref="bodyRef"
    v-if="state.message"
    :data-is-mobile="isMobile"
  >
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
    <message-tools
      :class="$style.tools"
      :message-id="messageId"
      v-if="hoverState.hover"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
      <message-stamp-list
        :class="$style.stamps"
        v-if="state.message.stamps.length > 0"
        :message-id="messageId"
        :stamps="state.message.stamps"
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
  ref,
  SetupContext,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { MessageId } from '@/types/entity-ids'
import useHover from '@/use/hover'
import useIsMobile from '@/use/isMobile'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageStampList from './MessageStampList.vue'
import MessageFileList from './MessageFileList.vue'
import MessageQuoteList from './MessageQuoteList.vue'
import useElementRenderObserver from './use/elementRenderObserver'
import MessageTools from './MessageTools.vue'
import useEmbeddings from './use/embeddings'

const useStyles = (
  props: { isEntryMessage: boolean },
  hoverState: { hover: boolean }
) =>
  reactive({
    body: makeStyles(theme => ({
      background: props.isEntryMessage
        ? transparentize(theme.accent.notification, 0.1)
        : hoverState.hover
        ? transparentize(theme.background.secondary, 0.6)
        : 'transparent'
    }))
  })

export default defineComponent({
  name: 'MessageElement',
  components: {
    UserIcon,
    MessageHeader,
    MessageStampList,
    MessageFileList,
    MessageTools,
    MessageQuoteList
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
  setup(props, context: SetupContext) {
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context)
    const bodyRef = ref<HTMLDivElement>(null)
    const { isMobile } = useIsMobile()
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      )
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    const styles = useStyles(props, hoverState)

    return {
      state,
      styles,
      onMouseEnter,
      onMouseLeave,
      bodyRef,
      embeddingsState,
      isMobile,
      hoverState
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
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px $messagePadding;
  &[data-is-mobile='true'] {
    padding: 8px $messagePaddingMobile;
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

.stamps {
  margin-top: 8px;
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
