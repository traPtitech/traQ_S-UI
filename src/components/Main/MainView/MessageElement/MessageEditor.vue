<template>
  <div ref="containerEle" :class="$style.container">
    <message-input-key-guide :show="isModifierKeyPressed" is-edit />
    <message-input-upload-progress
      v-if="isPostingAttachment"
      :progress="attachmentPostProgress"
    />
    <div :class="$style.inputContainer">
      <message-input-text-area
        ref="textareaComponentRef"
        v-model="text"
        :class="$style.inputTextArea"
        :is-posting="isPostingAttachment"
        simple-padding
        @add-attachments="onAddAttachments"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="editMessage"
      />
      <!-- divで包まないとホバー時の拡大の中心位置がずれる -->
      <div>
        <message-input-insert-stamp-button
          :class="$style.iconButton"
          :disabled="isPostingAttachment"
          @click="toggleStampPicker"
        />
        <message-input-upload-button
          :class="$style.iconButton"
          :disabled="isPostingAttachment"
          @click="addAttachment"
        />
      </div>
    </div>
    <div :class="$style.controls">
      <form-button label="キャンセル" type="tertiary" @click="cancel" />
      <form-button
        label="OK"
        :disabled="isPostingAttachment"
        @click="editMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import apis, { buildFilePathForPost, formatResizeError } from '/@/lib/apis'
import useModifierKey from '/@/components/Main/MainView/MessageInput/composables/useModifierKey'
import useTextStampPickerInvoker from '../composables/useTextStampPickerInvoker'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { countLength } from '/@/lib/basic/string'
import { useToastStore } from '/@/store/ui/toast'
import { getResizedFile } from '/@/lib/resize'
import useAttachments from '/@/components/Main/MainView/MessageInput/composables/useAttachments'
import type { AxiosProgressEvent } from 'axios'

const useEditMessage = (
  props: { messageId: string },
  text: Ref<string>,
  emit: (e: 'finishEditing') => void
) => {
  const { addErrorToast } = useToastStore()
  const editMessage = async () => {
    if (countLength(text.value) > MESSAGE_MAX_LENGTH) {
      addErrorToast('メッセージが長すぎます')
      return
    }

    try {
      await apis.editMessage(props.messageId, {
        content: text.value
      })
      emit('finishEditing')
    } catch {
      addErrorToast('メッセージの編集に失敗しました')
    }
  }
  const cancel = () => {
    emit('finishEditing')
  }
  return { editMessage, cancel }
}

const useAttachmentsEditor = (
  props: { channelId: string },
  text: Ref<string>
) => {
  const { addErrorToast } = useToastStore()

  const isPosting = ref(false)
  const progress = ref(0)

  const postAttachment = async (file: File) => {
    if (isPosting.value) return

    isPosting.value = true
    const attachmentFile = await getResizedFile(file)
    const { data } = await apis.postFile(attachmentFile, props.channelId, {
      /**
       * https://github.com/axios/axios#request-config
       */
      onUploadProgress(e: AxiosProgressEvent) {
        if (e.total === undefined || e.total === 0) return
        progress.value = e.loaded / e.total
      }
    })

    const fileUrl = buildFilePathForPost(data.id)
    text.value = text.value !== '' ? `${text.value}\n${fileUrl}` : fileUrl
    progress.value = 0
    isPosting.value = false
  }

  const { addAttachment } = useAttachments(postAttachment)
  const onAddAttachments = async (files: File[]) => {
    for (const file of files) {
      try {
        await postAttachment(file)
      } catch (err) {
        addErrorToast(
          formatResizeError(err, 'ファイルのアップロードに失敗しました')
        )
      }
    }
  }

  return {
    isPostingAttachment: isPosting,
    attachmentPostProgress: progress,
    onAddAttachments,
    addAttachment
  }
}
</script>

<script lang="ts" setup>
import MessageInputKeyGuide from '/@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputTextArea from '/@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import MessageInputUploadProgress from '/@/components/Main/MainView/MessageInput/MessageInputUploadProgress.vue'
import MessageInputUploadButton from '/@/components/Main/MainView/MessageInput/MessageInputUploadButton.vue'

const props = defineProps<{
  rawContent: string
  messageId: string
  channelId: string
}>()

const emit = defineEmits<{
  (e: 'finishEditing'): void
}>()

const text = ref(props.rawContent)

const { editMessage, cancel } = useEditMessage(props, text, emit)
const { isModifierKeyPressed, onModifierKeyDown, onModifierKeyUp } =
  useModifierKey()

const textareaComponentRef = ref<{
  textareaAutosizeRef: { $el: HTMLTextAreaElement }
}>()
const containerEle = ref<HTMLDivElement>()
const { toggleStampPicker } = useTextStampPickerInvoker(
  text,
  computed(() => textareaComponentRef.value?.textareaAutosizeRef.$el),
  containerEle
)

const {
  isPostingAttachment,
  attachmentPostProgress,
  addAttachment,
  onAddAttachments
} = useAttachmentsEditor(props, text)

onMounted(() => {
  textareaComponentRef.value?.textareaAutosizeRef.$el?.focus()
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
