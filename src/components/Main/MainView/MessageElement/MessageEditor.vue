<template>
  <div ref="containerEle" :class="$style.container">
    <message-input-key-guide :show="isModifierKeyPressed" is-edit />
    <message-input-upload-progress v-if="isPosting" :progress="progress" />
    <div :class="$style.inputContainer">
      <div>
        <message-input-upload-button @click="startAddingAttachment" />
      </div>
      <message-input-text-area
        ref="textareaRef"
        v-model="text"
        :class="$style.inputTextArea"
        @paste="onPaste"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="editMessage"
      />
      <!-- divで包まないとホバー時の拡大の中心位置がずれる -->
      <div>
        <message-input-insert-stamp-button @click="onStampClick" />
      </div>
    </div>
    <div :class="$style.controls">
      <form-button label="キャンセル" color="secondary" @click="cancel" />
      <form-button label="OK" @click="editMessage" />
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

const useAttachment = (
  text: Ref<string>,
  isPosting: Ref<boolean>,
  progress: Ref<number>,
  onError: (text: string) => void
) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true

  const onChange = () => {
    for (const file of input.files ?? []) {
      postAttachment(file)
    }
    // `input.files = null`ではリセットできない
    input.value = ''
  }

  input.addEventListener('change', onChange)

  const startAddingAttachment = () => {
    input.click()
  }

  const destroy = () => {
    input.removeEventListener('change', onChange)
  }

  const postAttachment = async (file: File) => {
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
    text.value += `\n${buildFilePathForPost(data.id)}`
    isPosting.value = false
    progress.value = 0
  }

  const onPaste = (event: ClipboardEvent) => {
    const dt = event?.clipboardData
    if (dt) {
      Array.from(dt.files).forEach(async file => {
        try {
          await postAttachment(file)
        } catch (e) {
          onError(e)
        }
      })
    }
  }

  return { onPaste, startAddingAttachment, destroy }
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

    const { addErrorToast } = useToastStore()
    const isPosting = ref(false)
    const progress = ref(0)
    const { onPaste, startAddingAttachment, destroy } = useAttachment(
      text,
      isPosting,
      progress,
      addErrorToast
    )
    onBeforeUnmount(destroy)

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
      isPosting,
      progress,
      startAddingAttachment
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
.stampButton {
  @include color-ui-secondary;
  margin: 0 4px;
  cursor: pointer;
}
.controls {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 16px;
}
</style>
