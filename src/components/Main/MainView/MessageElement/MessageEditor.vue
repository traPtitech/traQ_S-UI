<template>
  <div>
    <message-input-text-area
      :class="$style.inputTextArea"
      :text="textState.text"
      @input="onInputText"
      @modifier-key-down="onModifierKeyDown"
      @modifier-key-up="onModifierKeyUp"
      @post-message="editMessage"
    />
    <div :class="$style.controls">
      <form-button @click="cancel" label="キャンセル" color="secondary" />
      <form-button @click="editMessage" label="OK" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import apis from '@/lib/apis'
import store from '@/store'
import MessageInputTextArea from '@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import useTextInput, {
  TextState
} from '@/components/Main/MainView/MessageInput/use/textInput'
import FormButton from '@/components/UI/FormButton.vue'

const useEditMessage = (props: { messageId: string }, textState: TextState) => {
  const editMessage = async () => {
    await apis.editMessage(props.messageId, {
      content: textState.text
    })
    store.commit.domain.messagesView.unsetEditingMessageId()
  }
  const cancel = () => {
    store.commit.domain.messagesView.unsetEditingMessageId()
  }
  return { editMessage, cancel }
}

export default defineComponent({
  name: 'MessageEditor',
  components: {
    MessageInputTextArea,
    FormButton
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
    return {
      editMessage,
      cancel,
      textState,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp
    }
  }
})
</script>

<style lang="scss" module>
.inputTextArea {
  @include background-secondary;
  padding: 8px 12px;
  border-radius: 4px;
  overflow: hidden;
}
.controls {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 16px;
}
</style>
