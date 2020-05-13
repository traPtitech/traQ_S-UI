<template>
  <div
    :class="$style.body"
    ref="bodyRef"
    v-if="state.message"
    :data-is-mobile="isMobile"
    :data-is-pinned="state.isPinned"
    :data-is-entry="isEntryMessage"
    :data-is-editing="state.isEditing"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <message-pinned
      :message-id="messageId"
      v-if="state.message.pinned"
      :class="$style.pinned"
    />
    <message-tools
      v-if="isHovered"
      :class="$style.tools"
      :message-id="messageId"
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
import MessageStampList from './MessageStampList.vue'
import useElementRenderObserver from './use/elementRenderObserver'
import useEmbeddings from './use/embeddings'
import Icon from '@/components/UI/Icon.vue'
import MessagePinned from './MessagePinned.vue'
import MessageContents from './MessageContents.vue'
import MessageTools from '@/components/Main/MainView/MessageElement/MessageTools.vue'
import useHover from '@/use/hover'

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

    const { isHovered, onMouseEnter, onMouseLeave } = useHover()

    return {
      state,
      bodyRef,
      embeddingsState,
      isMobile,
      onStampDetailFoldingToggle,
      isHovered,
      onMouseEnter,
      onMouseLeave
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
  position: relative;
  grid-area: stamp-wrapper;
  margin-top: 8px;
  margin-left: 42px;
}

.toggleButton {
  color: transparent;
  transform: rotate(0turn);
  &[data-is-open] {
    transform: rotate(0.5turn);
  }
  .body:hover & {
    @include color-ui-secondary;
  }
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
