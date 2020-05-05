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
    <message-pinned
      :message-id="messageId"
      v-if="state.message.pinned"
      :class="$style.pinned"
    />
    <message-tools
      :class="$style.tools"
      :message-id="messageId"
      v-if="hoverState.hover"
    />
    <message-contents
      :class="$style.messageContents"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
    />
    <div :class="$style.stampWrapper">
      <icon
        name="rounded-triangle"
        :size="20"
        v-if="state.message.stamps.length > 0"
        :class="$style.toggleButton"
        :style="styles.toggleButton"
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
import MessageStampList from './MessageStampList.vue'
import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from './use/embeddings'
import Icon from '@/components/UI/Icon.vue'
import { Message } from '@traptitech/traq'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import MessageTools from '@/components/Main/MainView/MessageElement/MessageTools.vue'

const useStyles = (
  props: { isEntryMessage: boolean },
  hoverState: { hover: boolean },
  state: {
    message?: Message
    stampDetailFoldingState: boolean
    isEditing: boolean
  }
) =>
  reactive({
    body: makeStyles((theme, common) => ({
      background: state.message?.pinned
        ? transparentize(common.ui.pin, 0.2)
        : props.isEntryMessage
        ? transparentize(theme.accent.notification, 0.1)
        : hoverState.hover && !state.isEditing
        ? transparentize(theme.background.secondary, 0.6)
        : 'transparent'
    })),
    toggleButton: makeStyles(theme => ({
      transform: state.stampDetailFoldingState
        ? `rotate(0.5turn)`
        : `rotate(0turn)`,
      color: hoverState.hover ? theme.ui.secondary : 'transparent'
    }))
  })

export default defineComponent({
  name: 'MessageElement',
  components: {
    MessageContents,
    Icon,
    MessageStampList,
    MessagePinned,
    MessageTools
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
      ),
      stampDetailFoldingState: false
    })

    const { embeddingsState } = useEmbeddings(props)

    useElementRenderObserver(bodyRef, props, state, embeddingsState, context)

    const onStampDetailFoldingToggle = () => {
      state.stampDetailFoldingState = !state.stampDetailFoldingState
    }

    const styles = useStyles(props, hoverState, state)

    return {
      state,
      styles,
      onMouseEnter,
      onMouseLeave,
      bodyRef,
      embeddingsState,
      isMobile,
      onStampDetailFoldingToggle,
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
    'pinned pinned'
    'message-contents message-contents'
    'message-contents message-contents'
    'message-contents message-contents'
    '... stamp-wrapper';
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

.messageContents {
  grid-area: message-contents;
  min-width: 0;
}

.stampWrapper {
  grid-area: stamp-wrapper;
  margin-top: 8px;
}

.toggleButton {
  position: absolute;
  left: -26px;
  top: 2px;
  cursor: pointer;
}

.tools {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 1;
}
</style>
