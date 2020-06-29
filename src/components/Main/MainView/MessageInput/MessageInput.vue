<template>
  <div :class="$style.container" :data-is-mobile="isMobile">
    <div v-if="isArchived" :class="$style.inputContainer" data-is-archived>
      <icon :class="$style.controls" name="archive" mdi />
      <div>
        アーカイブチャンネルのため、投稿できません
      </div>
    </div>
    <template v-else>
      <portal-target
        :class="$style.stampPickerLocator"
        :name="targetPortalName"
      />
      <message-input-file-list />
      <message-input-typing-users :typing-users="typingUsers" />
      <message-input-key-guide :show="showKeyGuide" />
      <message-input-upload-progress v-if="isPosting" :progress="progress" />
      <div :class="$style.inputContainer">
        <message-input-upload-button
          :class="$style.controls"
          @click="addAttachment"
        />
        <message-input-text-area
          ref="textareaRef"
          :text="textState.text"
          :is-posting="isPosting"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInputText"
          @modifier-key-down="onModifierKeyDown"
          @modifier-key-up="onModifierKeyUp"
          @post-message="postMessage"
        />
        <message-input-controls
          :class="$style.controls"
          :can-post-message="canPostMessage"
          :is-posting="isPosting"
          @click-send="postMessage"
          @click-stamp="onStampClick"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  onBeforeUnmount,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import useIsMobile from '@/use/isMobile'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import useAttachments from './use/attachments'
import useTextInput from './use/textInput'
import usePostMessage from './use/postMessage'
import useFocus from './use/focus'
import useEditingStatus from './use/editingStatus'
import MessageInputTypingUsers from './MessageInputTypingUsers.vue'
import MessageInputKeyGuide from './MessageInputKeyGuide.vue'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputControls from './MessageInputControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'
import MessageInputUploadProgress from './MessageInputUploadProgress.vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MessageInput',
  components: {
    MessageInputTypingUsers,
    MessageInputKeyGuide,
    MessageInputTextArea,
    MessageInputControls,
    MessageInputFileList,
    MessageInputUploadButton,
    MessageInputUploadProgress,
    Icon
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    }
  },
  setup(props, context) {
    const { isMobile } = useIsMobile()
    const {
      textState,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp
    } = useTextInput()
    const { attachmentsState, addAttachment, destroy } = useAttachments()

    onBeforeUnmount(() => {
      destroy()
    })

    const isArchived = computed(
      () => store.state.entities.channels[props.channelId]?.archived ?? false
    )

    const { isFocused, onFocus, onBlur } = useFocus()
    useEditingStatus(
      computed(() => props.channelId),
      textState,
      isFocused
    )

    const { postMessage, isPosting, progress } = usePostMessage(
      textState,
      props
    )

    const typingUsers = computed(
      () => store.getters.domain.messagesView.typingUsers
    )

    const canPostMessage = computed(
      () => !isPosting.value && !(textState.isEmpty && attachmentsState.isEmpty)
    )
    const showKeyGuide = computed(
      () =>
        textState.isModifierKeyPressed &&
        (store.state.app.browserSettings.sendWithModifierKey !== 'modifier' ||
          canPostMessage.value)
    )

    const textareaRef = ref<{ $el: HTMLTextAreaElement }>()
    const targetPortalName = 'message-input-stamp-picker'
    const { invokeStampPicker } = useTextStampPickerInvoker(
      targetPortalName,
      textState,
      textareaRef,
      context
    )

    const onStampClick = () => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker()
      }
    }

    return {
      textareaRef,
      isArchived,
      targetPortalName,
      isMobile,
      typingUsers,
      textState,
      attachmentsState,
      onFocus,
      onBlur,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp,
      onStampClick,
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
$inputPaddingMobile: 16px;
$radius: 4px;
.container {
  @include background-secondary;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  margin: {
    left: $inputPadding;
    right: $inputPadding;
    bottom: 24px - $radius;
  }

  &[data-is-mobile='true'] {
    margin: {
      left: $inputPaddingMobile;
      right: $inputPaddingMobile;
    }
  }

  border-radius: $radius;
  transform: translateY(-$radius);
  z-index: $z-index-message-input;
}
.stampPickerLocator {
  width: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  right: 0;
  top: -8px;
  transform: translateY(-100%);
}
.inputContainer {
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 8px 16px;
  justify-content: space-between;
  align-items: flex-end;

  .container[data-is-mobile='true'] & {
    padding: 4px 0;
  }

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
  margin: 0 16px;
  .container[data-is-mobile='true'] & {
    margin: 0 8px;
  }

  &:first-child:first-child {
    margin-left: 0;
  }

  &:last-child:last-child {
    margin-right: 0;
  }
}
</style>
