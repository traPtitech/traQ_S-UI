<template>
  <div :class="$style.container" ref="containerEle">
    <message-input-key-guide :show="isModifierKeyPressed" is-edit />
    <div :class="$style.inputContainer">
      <message-input-text-area
        ref="textareaRef"
        :class="$style.inputTextArea"
        v-model="text"
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
      <form-button @click="cancel" label="キャンセル" color="secondary" />
      <form-button @click="editMessage" label="OK" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import apis from '@/lib/apis'
import store from '@/store'
import MessageInputKeyGuide from '@/components/Main/MainView/MessageInput/MessageInputKeyGuide.vue'
import MessageInputTextArea from '@/components/Main/MainView/MessageInput/MessageInputTextArea.vue'
import useModifierKey from '@/components/Main/MainView/MessageInput/use/modifierKey'
import useTextStampPickerInvoker from '../use/textStampPickerInvoker'
import FormButton from '@/components/UI/FormButton.vue'
import MessageInputInsertStampButton from '@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import { MESSAGE_MAX_LENGTH } from '@/lib/validate'
import { countLength } from '@/lib/util/string'
import useToastStore from '@/providers/toastStore'

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
    const text = ref(props.rawContent)
    const { editMessage, cancel } = useEditMessage(props, text)
    const {
      isModifierKeyPressed,
      onModifierKeyDown,
      onModifierKeyUp
    } = useModifierKey()

    const textareaRef = ref<{ $el: HTMLTextAreaElement }>()
    const containerEle = ref<HTMLDivElement>()
    const { toggleStampPicker } = useTextStampPickerInvoker(
      text,
      textareaRef,
      containerEle
    )

    const onStampClick = () => {
      toggleStampPicker()
    }

    return {
      containerEle,
      textareaRef,
      editMessage,
      cancel,
      text,
      isModifierKeyPressed,
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
