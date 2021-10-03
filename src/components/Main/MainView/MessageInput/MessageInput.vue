<template>
  <div
    ref="containerEle"
    :class="$style.container"
    :data-is-mobile="$boolAttr(isMobile)"
  >
    <message-input-typing-users :typing-users="typingUsers" />
    <message-input-key-guide :show="showKeyGuide" />
    <message-input-upload-progress v-if="isPosting" :progress="progress" />
    <message-input-preview
      v-if="isPreviewShown && state.text !== ''"
      :class="$style.preview"
      :text="state.text"
    />
    <message-input-file-list :class="$style.fileList" :channel-id="channelId" />
    <div v-if="isArchived" :class="$style.inputContainer" data-is-archived>
      <icon :class="$style.controls" name="archive" mdi />
      <div>アーカイブチャンネルのため、投稿できません</div>
    </div>
    <div v-else :class="$style.inputContainer">
      <message-input-left-controls
        v-model:is-expanded="isLeftControlsExpanded"
        v-model:is-preview-shown="isPreviewShown"
        :class="$style.leftControls"
        @click-add-attachment="addAttachment"
      />
      <message-input-text-area
        ref="textareaRef"
        v-model="state.text"
        :channel-id="channelId"
        :is-posting="isPosting"
        :shrink-to-one-line="isLeftControlsExpanded"
        @focus="onFocus"
        @blur="onBlur"
        @paste="onPaste"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="postMessage"
      />
      <message-input-right-controls
        :class="$style.rightControls"
        :can-post-message="canPostMessage"
        :is-posting="isPosting"
        @click-send="postMessage"
        @click-stamp="toggleStampPicker"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  onBeforeUnmount,
  ref,
  toRef
} from 'vue'
import store from '/@/store'
import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import useIsMobile from '/@/use/isMobile'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import useAttachments from './use/attachments'
import useModifierKey from './use/modifierKey'
import usePostMessage from './use/postMessage'
import useFocus from './use/focus'
import usePaste from './use/paste'
import useEditingStatus from './use/editingStatus'
import MessageInputLeftControls from './MessageInputLeftControls.vue'
import MessageInputPreview from './MessageInputPreview.vue'
import MessageInputTypingUsers from './MessageInputTypingUsers.vue'
import MessageInputKeyGuide from './MessageInputKeyGuide.vue'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputRightControls from './MessageInputRightControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadProgress from './MessageInputUploadProgress.vue'
import Icon from '/@/components/UI/Icon.vue'
import useMessageInputState from '/@/providers/messageInputState'
import useToastStore from '/@/providers/toastStore'
import { useMessageInputStateAttachment } from '/@/providers/messageInputState'

export default defineComponent({
  name: 'MessageInput',
  components: {
    MessageInputPreview,
    MessageInputTypingUsers,
    MessageInputKeyGuide,
    MessageInputTextArea,
    MessageInputLeftControls,
    MessageInputRightControls,
    MessageInputFileList,
    MessageInputUploadProgress,
    Icon
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    }
  },
  setup(props) {
    const { isMobile } = useIsMobile()
    const channelId = toRef(props, 'channelId')
    const { state, isEmpty, isTextEmpty } = useMessageInputState(channelId)
    const { addErrorToast } = useToastStore()
    const { addAttachment: addStateAttachment } =
      useMessageInputStateAttachment(channelId, addErrorToast)
    const { addAttachment, destroy } = useAttachments(addStateAttachment)
    const { isModifierKeyPressed, onModifierKeyDown, onModifierKeyUp } =
      useModifierKey()
    const isLeftControlsExpanded = ref(false)
    const isPreviewShown = ref(false)

    onBeforeUnmount(() => {
      destroy()
    })

    const isArchived = computed(
      () =>
        store.state.entities.channelsMap.get(props.channelId)?.archived ?? false
    )

    const { isFocused, onFocus, onBlur } = useFocus()
    useEditingStatus(channelId, isTextEmpty, isFocused)

    const { onPaste } = usePaste(toRef(props, 'channelId'))

    const { postMessage, isPosting, progress } = usePostMessage(channelId)

    const typingUsers = computed(
      () => store.getters.domain.messagesView.typingUsers
    )

    const canPostMessage = computed(() => !isPosting.value && !isEmpty.value)
    const showKeyGuide = computed(
      () =>
        isModifierKeyPressed.value &&
        (store.state.app.browserSettings.sendWithModifierKey !== 'modifier' ||
          canPostMessage.value)
    )

    const textareaRef = ref<{
      textareaAutosizeRef: { $el: HTMLTextAreaElement }
    }>()
    const containerEle = ref<HTMLDivElement>()
    const { toggleStampPicker } = useTextStampPickerInvoker(
      toRef(state, 'text'),
      computed(() => textareaRef.value?.textareaAutosizeRef),
      containerEle
    )

    return {
      containerEle,
      textareaRef,
      isArchived,
      isMobile,
      typingUsers,
      state,
      isLeftControlsExpanded,
      isPreviewShown,
      onFocus,
      onBlur,
      onPaste,
      onModifierKeyDown,
      onModifierKeyUp,
      toggleStampPicker,
      postMessage,
      addAttachment,
      showKeyGuide,
      canPostMessage,
      isPosting,
      progress
    }
  }
})
</script>

<style lang="scss" module>
$inputPadding: 32px;
$radius: 4px;
.container {
  @include background-secondary;
  position: relative;
  padding: 0.5rem 1rem;

  z-index: $z-index-message-input;

  &:not([data-is-mobile]) {
    margin: {
      left: $inputPadding;
      right: $inputPadding;
      bottom: 24px - $radius;
    }
    border-radius: $radius;
    transform: translateY(-$radius);

    border: solid 2px transparent;
    &:focus-within {
      border-color: $theme-accent-focus;
    }
  }
}
.preview {
  margin-bottom: 8px;
}
.fileList {
  margin-bottom: 8px;
}
.inputContainer {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;

  &[data-is-archived] {
    @include color-ui-secondary;
    justify-content: flex-start;
    align-items: center;
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.controls {
  flex: {
    grow: 0;
    shrink: 0;
  }
  margin: 8px;

  &:first-child:first-child {
    margin-left: 0;
  }

  &:last-child:last-child {
    margin-right: 0;
  }
}
.leftControls {
  margin: 8px 8px 8px 0;
}
.rightControls {
  position: absolute;
  right: 8px;
  bottom: 0;
  margin: 8px 0;
}
</style>
