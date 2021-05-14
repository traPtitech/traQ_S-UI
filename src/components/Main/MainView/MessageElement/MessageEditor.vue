<template>
  <div ref="containerEle" :class="$style.container">
    <message-input-key-guide :show="isModifierKeyPressed" is-edit />
    <message-input-upload-progress
      v-if="isPostingAttachment"
      :progress="attachmentPostProgress"
    />
    <div :class="$style.inputContainer">
      <message-input-text-area
        ref="textareaRef"
        v-model="text"
        :class="$style.inputTextArea"
        :is-posting="isPostingAttachment"
        @paste="onPaste"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="editMessage"
      />
      <!-- divで包まないとホバー時の拡大の中心位置がずれる -->
      <div>
        <message-input-insert-stamp-button
          :class="$style.iconButton"
          :disabled="isPostingAttachment"
          @click="onStampClick"
        />
        <message-input-upload-button
          :class="$style.iconButton"
          :disabled="isPostingAttachment"
          @click="addAttachment"
        />
      </div>
    </div>
    <div :class="$style.controls">
      <form-button label="キャンセル" color="secondary" @click="cancel" />
      <form-button
        label="OK"
        :disabled="isPostingAttachment"
        @click="editMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, Ref, ref } from 'vue'
import apis, { buildFilePathForPost } from '@/lib/apis'
import store from '@/store'
import MessageInputKeyGuide from '@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputTextArea from '@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import useModifierKey from '@/components/Main/MainView/MessageInput/use/modifierKey'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import FormButton from '@/components/UI/FormButton.vue'
import MessageInputInsertStampButton from '@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import MessageInputUploadProgress from '@/components/Main/MainView/MessageInput/MessageInputUploadProgress.vue'
import MessageInputUploadButton from '@/components/Main/MainView/MessageInput/MessageInputUploadButton.vue'
import { MESSAGE_MAX_LENGTH } from '@/lib/validate'
import { countLength } from '@/lib/util/string'
import useToastStore from '@/providers/toastStore'
import { getAttachmentFile } from '@/lib/resize'
import useAttachments from '@/components/Main/MainView/MessageInput/use/attachments'

const useEditMessage = (props: { messageId: string }, text: Ref<string>) => {
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
      store.commit.domain.messagesView.unsetEditingMessageId()
    } catch {
      addErrorToast('メッセージの編集に失敗しました')
    }
  }
  const cancel = () => {
    store.commit.domain.messagesView.unsetEditingMessageId()
  }
  return { editMessage, cancel }
}

const useAttachmentsEditor = (text: Ref<string>) => {
  const { addErrorToast } = useToastStore()

  const isPosting = ref(false)
  const progress = ref(0)

  const postAttachment = async (file: File) => {
    if (isPosting.value) return

    const channelId = store.state.domain.messagesView.currentChannelId
    if (!channelId) return

    isPosting.value = true
    const attachmentFile = await getAttachmentFile(file)
    const { data } = await apis.postFile(attachmentFile, channelId, {
      /**
       * https://github.com/axios/axios#request-config
       */
      onUploadProgress(e: ProgressEvent) {
        progress.value = e.loaded / e.total
      }
    })

    const fileUrl = buildFilePathForPost(data.id)
    text.value = text.value !== '' ? `${text.value}\n${fileUrl}` : fileUrl
    progress.value = 0
    isPosting.value = false
  }

  const { addAttachment, destroy } = useAttachments(postAttachment)

  const onPaste = (event: ClipboardEvent) => {
    const dt = event?.clipboardData
    if (dt) {
      Array.from(dt.files).forEach(async file => {
        try {
          await postAttachment(file)
        } catch (e) {
          addErrorToast(e)
        }
      })
    }
  }

  return {
    isPostingAttachment: isPosting,
    attachmentPostProgress: progress,
    onPaste,
    addAttachment,
    destroy
  }
}

export default defineComponent({
  name: 'MessageEditor',
  components: {
    MessageInputKeyGuide,
    MessageInputTextArea,
    FormButton,
    MessageInputInsertStampButton,
    MessageInputUploadProgress,
    MessageInputUploadButton
  },
  props: {
    rawContent: {
      type: String,
      required: true
    },
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const text = ref(props.rawContent)

    const { editMessage, cancel } = useEditMessage(props, text)
    const {
      isModifierKeyPressed,
      onModifierKeyDown,
      onModifierKeyUp
    } = useModifierKey()

    const textareaRef = ref<{
      textareaAutosizeRef: { $el: HTMLTextAreaElement }
    }>()
    const containerEle = ref<HTMLDivElement>()
    const { toggleStampPicker } = useTextStampPickerInvoker(
      text,
      computed(() => textareaRef.value?.textareaAutosizeRef),
      containerEle
    )

    const onStampClick = () => {
      toggleStampPicker()
    }

    const {
      isPostingAttachment,
      attachmentPostProgress,
      addAttachment,
      onPaste,
      destroy
    } = useAttachmentsEditor(text)
    onBeforeUnmount(() => {
      destroy()
    })

    return {
      containerEle,
      textareaRef,
      editMessage,
      cancel,
      isModifierKeyPressed,
      onModifierKeyDown,
      onModifierKeyUp,
      onStampClick,
      text,
      onPaste,
      isPostingAttachment,
      attachmentPostProgress,
      addAttachment
    }
  }
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
