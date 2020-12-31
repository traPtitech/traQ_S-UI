<template>
  <div :class="$style.container" ref="containerEle">
    <message-input-key-guide :show="textState.isModifierKeyPressed" is-edit />
    <div :class="$style.inputContainer">
      <message-input-text-area
        ref="textareaRef"
        :class="$style.inputTextArea"
        v-model="textState.text"
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
import _store from '@/_store'
import MessageInputKeyGuide from '@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputTextArea from '@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import useTextInput, {
  TextState
} from '@/components/Main/MainView/MessageInput/use/textInput'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import FormButton from '@/components/UI/FormButton.vue'
import MessageInputInsertStampButton from '@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import { MESSAGE_MAX_LENGTH } from '@/lib/validate'
import { countLength } from '@/lib/util/string'
import useToastStore from '@/use/toastStore'

const useEditMessage = (props: { messageId: string }, textState: TextState) => {
  const { addErrorToast } = useToastStore()
  const editMessage = async () => {
    if (countLength(textState.text) > MESSAGE_MAX_LENGTH) {
      addErrorToast('メッセージが長すぎます')
      return
    }

    try {
      await apis.editMessage(props.messageId, {
        content: textState.text
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
    const { textState, onModifierKeyDown, onModifierKeyUp } = useTextInput(
      props.rawContent
    )
    const { editMessage, cancel } = useEditMessage(props, textState)

    const textareaRef = ref<{ $el: HTMLTextAreaElement }>()
    const { invokeStampPicker } = useTextStampPickerInvoker(
      textState,
      textareaRef
    )

    const containerEle = ref<HTMLDivElement>()
    const onStampClick = (e: MouseEvent) => {
      if (_store.getters.ui.stampPicker.isStampPickerShown) {
        _store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        if (!containerEle.value) return
        invokeStampPicker(containerEle.value, 'bottom-right')
      }
    }

    return {
      containerEle,
      textareaRef,
      editMessage,
      cancel,
      textState,
      onModifierKeyDown,
      onModifierKeyUp,
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
