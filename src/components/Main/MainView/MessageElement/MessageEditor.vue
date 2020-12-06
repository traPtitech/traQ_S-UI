<template>
  <div :class="$style.container">
    <message-input-key-guide :show="textState.isModifierKeyPressed" is-edit />
    <div :class="$style.inputContainer">
      <message-input-text-area
        ref="textareaRef"
        :class="$style.inputTextArea"
        :text="textState.text"
        @input-value="onInputText"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="editMessage"
      />
      <message-input-insert-stamp-button @click="onStampClick" />
    </div>
    <div :class="$style.controls">
      <form-button @click="cancel" label="キャンセル" color="secondary" />
      <form-button @click="editMessage" label="OK" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import apis from '@/lib/apis'
import store from '@/store'
import MessageInputKeyGuide from '@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputTextArea from '@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import useTextInput, {
  TextState
} from '@/components/Main/MainView/MessageInput/use/textInput'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import FormButton from '@/components/UI/FormButton.vue'
import MessageInputInsertStampButton from '@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'

const teleportTargetName = 'message-menu-popup'

const useEditMessage = (props: { messageId: string }, textState: TextState) => {
  const editMessage = async () => {
    try {
      await apis.editMessage(props.messageId, {
        content: textState.text
      })
      store.commit.domain.messagesView.unsetEditingMessageId()
    } catch {
      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'メッセージの編集に失敗しました'
      })
    }
  }
  const cancel = () => {
    store.commit.domain.messagesView.unsetEditingMessageId()
  }
  return { editMessage, cancel }
}

export default defineComponent({
  name: 'MessageEditor',
  components: {
    MessageInputKeyGuide,
    MessageInputTextArea,
    FormButton,
    MessageInputInsertStampButton
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
    const {
      textState,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp
    } = useTextInput(props.rawContent)
    const { editMessage, cancel } = useEditMessage(props, textState)

    const textareaRef = ref<{ $el: HTMLTextAreaElement }>()
    const { invokeStampPicker } = useTextStampPickerInvoker(
      teleportTargetName,
      textState,
      textareaRef
    )

    const onStampClick = (e: MouseEvent) => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker({ x: e.pageX, y: e.pageY })
      }
    }

    return {
      textareaRef,
      editMessage,
      cancel,
      textState,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp,
      teleportTargetName,
      onStampClick
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
