<template>
  <div
    ref="containerEle"
    :class="$style.container"
    :data-is-mobile="$boolAttr(isMobile)"
  >
    <button
      v-if="showToNewMessageButton"
      :class="$style.toNewMessageButton"
      @click="onClickToNewMessageButton"
    >
      最新メッセージ<a-icon name="arrow-down" mdi />
    </button>
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
      <a-icon :class="$style.controls" name="archive" mdi />
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
        ref="textareaComponentRef"
        v-model="state.text"
        :channel-id="channelId"
        :is-posting="isPosting"
        :shrink-to-one-line="isMobile && isLeftControlsExpanded"
        @focus="onFocus"
        @blur="onBlur"
        @add-attachments="onAddAttachments"
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

<script lang="ts" setup>
import MessageInputLeftControls from './MessageInputLeftControls.vue'
import MessageInputPreview from './MessageInputPreview.vue'
import MessageInputTypingUsers from './MessageInputTypingUsers.vue'
import MessageInputKeyGuide from './MessageInputKeyGuide.vue'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputRightControls from './MessageInputRightControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadProgress from './MessageInputUploadProgress.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { computed, ref, toRef, watch, watchEffect } from 'vue'
import type { ChannelId, DMChannelId, UserId } from '/@/types/entity-ids'
import { useResponsiveStore } from '/@/store/ui/responsive'
import useTextStampPickerInvoker from '../composables/useTextStampPickerInvoker'
import useAttachments from './composables/useAttachments'
import useModifierKey from './composables/useModifierKey'
import usePostMessage from './composables/usePostMessage'
import useFocus from './composables/useFocus'
import { useToastStore } from '/@/store/ui/toast'
import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import useMessageInputStateAttachment from '/@/composables/messageInputState/useMessageInputStateAttachment'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { $boolAttr } from '/@/bool-attr'

const props = defineProps<{
  channelId: ChannelId | DMChannelId
  typingUsers: UserId[]
  showToNewMessageButton: boolean
}>()
const emit = defineEmits<{
  (e: 'clickToNewMessageButton'): void
}>()

const { isMobile } = useResponsiveStore()
const channelId = toRef(props, 'channelId')
const { state, isEmpty, isTextEmpty } = useMessageInputState(channelId)
const { addErrorToast } = useToastStore()
const { addAttachment: addStateAttachment } = useMessageInputStateAttachment(
  channelId,
  addErrorToast
)
const { addAttachment } = useAttachments(addStateAttachment)
const { isModifierKeyPressed, onModifierKeyDown, onModifierKeyUp } =
  useModifierKey()
const { sendWithModifierKey } = useBrowserSettings()
const { channelsMap } = useChannelsStore()
const isLeftControlsExpanded = ref(false)
const isPreviewShown = ref(false)

const isArchived = computed(
  () => channelsMap.value.get(props.channelId)?.archived ?? false
)

const { isFocused, onFocus, onBlur } = useFocus()
watchEffect(() => {
  if (isFocused.value) {
    isLeftControlsExpanded.value = false
  }
})

const { isTyping } = useViewStateSenderStore()
let timeoutId: NodeJS.Timeout
watch(state, () => {
  isTyping.value = !isTextEmpty.value && isFocused.value
  if (isTyping.value) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    isTyping.value = false
  }, 2000)
})

const onAddAttachments = async (files: File[]) => {
  for (const file of files) {
    await addStateAttachment(file)
  }
}

const { postMessage, isPosting, progress } = usePostMessage(channelId)

const canPostMessage = computed(() => !isPosting.value && !isEmpty.value)
const showKeyGuide = computed(
  () =>
    isModifierKeyPressed.value &&
    (sendWithModifierKey.value !== 'modifier' || canPostMessage.value)
)

const textareaComponentRef = ref<{
  textareaAutosizeRef: { $el: HTMLTextAreaElement }
}>()
const containerEle = ref<HTMLDivElement>()
const { toggleStampPicker } = useTextStampPickerInvoker(
  toRef(state, 'text'),
  computed(() => textareaComponentRef.value?.textareaAutosizeRef.$el),
  containerEle
)

const onClickToNewMessageButton = () => {
  emit('clickToNewMessageButton')
}
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
    @include color-ui-secondary-inactive;
    justify-content: flex-start;
    align-items: center;
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

.toNewMessageButton {
  color: $theme-ui-secondary-default;
  background-color: $theme-background-secondary-default;
  width: 160px;
  height: 40px;
  position: absolute;
  top: -52px;
  right: 12px;
  border-radius: 8px;
  z-index: $z-index-to-new-message-button;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  gap: 10px;
  cursor: pointer;
  &:hover {
    background-color: $theme-background-tertiary-default;
  }
}
</style>
