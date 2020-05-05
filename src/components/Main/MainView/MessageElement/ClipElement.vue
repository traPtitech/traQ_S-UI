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
    <clip-tools
      :class="$style.tools"
      :message-id="messageId"
      v-if="hoverState.hover"
    />
    <message-contents
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
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
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { MessageId } from '@/types/entity-ids'
import useHover from '@/use/hover'
import useIsMobile from '@/use/isMobile'

import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from './use/embeddings'
import Icon from '@/components/UI/Icon.vue'
import { Message } from '@traptitech/traq'

import MessageContents from './MessageContents.vue'
import ClipTools from '@/components/Main/MainView/MessageElement/ClipTools.vue'

const useStyles = (
  props: { isEntryMessage: boolean },
  hoverState: { hover: boolean },
  state: {
    message?: Message
    isEditing: boolean
  }
) =>
  reactive({
    body: makeStyles(theme => ({
      background: props.isEntryMessage
        ? transparentize(theme.accent.notification, 0.1)
        : hoverState.hover && !state.isEditing
        ? transparentize(theme.background.secondary, 0.6)
        : 'transparent'
    }))
  })

export default defineComponent({
  name: 'MessageElement',
  components: {
    Icon,
    MessageContents,
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
    const { hoverState, onMouseEnter, onMouseLeave } = useHover()
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
      )
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    const styles = useStyles(props, hoverState, state)

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
  grid-template-rows: auto 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px $messagePadding;
  &[data-is-mobile='true'] {
    padding: 8px $messagePaddingMobile;
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
  position: absolute;
  left: -26px;
  top: 2px;
  cursor: pointer;
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
