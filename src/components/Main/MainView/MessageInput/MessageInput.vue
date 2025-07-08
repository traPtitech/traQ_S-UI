<template>
  <div
    ref="containerEle"
    :class="$style.container"
    :data-is-mobile="$boolAttr(forceMobileStyle || isMobile)"
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
        v-model:is-left-controls-expanded="isLeftControlsExpanded"
        v-model:is-preview-shown="isPreviewShown"
        v-model:is-input-text-area-expanded="isInputTextAreaExpanded"
        :show-text-area-expand-button="showTextAreaExpandButton"
        :class="$style.leftControls"
        @click-add-attachment="addAttachment"
        @toggle-left-controls-expanded="
          textareaComponentRef?.textareaAutosizeRef?.autosizeUpdateTextarea
        "
      />
      <message-input-text-area
        ref="textareaComponentRef"
        v-model="state.text"
        v-model:show-text-area-expand-button="showTextAreaExpandButton"
        :channel-id="channelId"
        :is-posting="isPosting"
        :shrink-to-one-line="
          (forceMobileStyle || isMobile) && isLeftControlsExpanded
        "
        :is-input-text-area-expanded="isInputTextAreaExpanded"
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
import { computed, ref, toRef, watch, watchEffect } from 'vue'
import useTextStampPickerInvoker from '../composables/useTextStampPickerInvoker'
import useAttachments from './composables/useAttachments'
import useModifierKey from './composables/useModifierKey'
import usePostMessage from './composables/usePostMessage'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputKeyGuide from './MessageInputKeyGuide.vue'
import MessageInputLeftControls from './MessageInputLeftControls.vue'
import MessageInputPreview from './MessageInputPreview.vue'
import MessageInputRightControls from './MessageInputRightControls.vue'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputTypingUsers from './MessageInputTypingUsers.vue'
import MessageInputUploadProgress from './MessageInputUploadProgress.vue'
import { $boolAttr } from '/@/bool-attr'
import AIcon from '/@/components/UI/AIcon.vue'
import useFocus from '/@/composables/dom/useFocus'
import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import useMessageInputStateAttachment from '/@/composables/messageInputState/useMessageInputStateAttachment'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useChannelsStore } from '/@/store/entities/channels'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useToastStore } from '/@/store/ui/toast'
import type { ChannelId, DMChannelId, UserId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId | DMChannelId
  typingUsers: UserId[]
  showToNewMessageButton: boolean
  forceMobileStyle?: boolean
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
const isInputTextAreaExpanded = ref(true)
const showTextAreaExpandButton = ref(false)

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
  }, 10000)
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

const textareaComponentRef = ref<InstanceType<typeof MessageInputTextArea>>()
const containerEle = ref<HTMLDivElement>()
const { toggleStampPicker } = useTextStampPickerInvoker(
  toRef(state, 'text'),
  computed(() => textareaComponentRef.value?.textareaAutosizeRef?.$el),
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
  margin: 2px 8px 8px 0;
}
.rightControls {
  position: absolute;
  right: 8px;
  bottom: 0;
  margin: 8px 0;
}

.toNewMessageButton {
  @include size-body2;

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
  font-weight: bold;
  gap: 10px;
  cursor: pointer;
  &:hover {
    background-color: $theme-background-tertiary-default;
  }
}
</style>
