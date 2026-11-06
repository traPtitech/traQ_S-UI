<template>
  <div ref="containerEle" :class="$style.container">
    <MessageInputKeyGuide :show="isModifierKeyPressed" is-edit />
    <MessageInputUploadProgress
      v-if="isPostingAttachment"
      :progress="attachmentPostProgress"
    />

    <div :class="$style.inputContainer">
      <MessageInputEditor
        ref="messageInputRef"
        v-model="text"
        :document-key="messageId"
        :class="$style.inputTextArea"
        :is-posting="isBusy"
        simple-padding
        is-max-height-none
        @add-attachments="onAddAttachments"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="editMessage"
      />

      <!-- divで包まないとホバー時の拡大の中心位置がずれる -->
      <div>
        <MessageInputInsertStampButton
          :class="$style.iconButton"
          :disabled="isBusy"
          @click="toggleStampPicker"
        />

        <MessageInputUploadButton
          :class="$style.iconButton"
          :disabled="isBusy"
          @click="openAttachmentPicker"
        />
      </div>
    </div>

    <div :class="$style.controls">
      <FormButton
        label="キャンセル"
        type="tertiary"
        :disabled="isBusy"
        @click="cancel"
      />

      <FormButton label="OK" :disabled="isBusy" @click="editMessage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef } from 'vue'

import MessageInputEditor from '/@/components/Main/MainView/MessageInput/MessageInputEditor.vue'
import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import MessageInputKeyGuide from '/@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputUploadButton from '/@/components/Main/MainView/MessageInput/MessageInputUploadButton.vue'
import MessageInputUploadProgress from '/@/components/Main/MainView/MessageInput/MessageInputUploadProgress.vue'
import useModifierKey from '/@/components/Main/MainView/MessageInput/composables/useModifierKey'
import FormButton from '/@/components/UI/FormButton.vue'

import useTextStampPickerInvoker from '../composables/useTextStampPickerInvoker'
import { useMessageEditing } from './composables/useMessageEditing'

const props = defineProps<{
  rawContent: string
  messageId: string
  channelId: string
}>()

const emit = defineEmits<{
  (e: 'finishEditing'): void
}>()

const text = ref(props.rawContent)

const {
  editMessage,
  cancel,
  isBusy,
  isPostingAttachment,
  attachmentPostProgress,
  openAttachmentPicker,
  onAddAttachments
} = useMessageEditing(props, text, emit)

const { isModifierKeyPressed, onModifierKeyDown, onModifierKeyUp } =
  useModifierKey()

const messageInputRef = shallowRef<InstanceType<typeof MessageInputEditor>>()

const inputHandle = computed(() => messageInputRef.value?.inputHandle)

const containerEle = ref<HTMLDivElement>()

const { toggleStampPicker } = useTextStampPickerInvoker(
  text,
  inputHandle,
  containerEle
)

onMounted(() => {
  inputHandle.value?.focus('end')
})
</script>

<style lang="scss" module>
.container {
  position: relative;
}
.inputContainer {
  @include background-secondary;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  justify-content: space-between;

  .container[data-is-mobile] & {
    padding: 4px 0;
  }
}
.inputTextArea {
  margin: 0 4px;
  overflow: hidden;
}
.iconButton {
  margin: 4px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.controls {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 16px;
}
</style>
