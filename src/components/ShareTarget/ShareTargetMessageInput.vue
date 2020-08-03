<template>
  <div :class="$style.container">
    <label :for="id" :class="$style.label">メッセージ</label>
    <div :class="$style.wrapper">
      <div :class="$style.inputContainer">
        <div :class="$style.inputWrapper">
          <textarea
            ref="textareaRef"
            :class="$style.input"
            :id="id"
            :value="textState.text"
            :is-posting="isPosting"
            @input="onInput"
          />
        </div>
        <div :class="$style.controls">
          <message-input-insert-stamp-button
            :class="$style.button"
            @click.native="onStampClick"
          />
          <message-input-upload-button
            :class="$style.button"
            @click.native="addAttachment"
          />
        </div>
      </div>
      <message-input-file-list :class="$style.fileList" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onBeforeUnmount,
  watch,
  onMounted,
  shallowRef
} from 'vue'
import { randomString } from '@/lib/util/randomString'
import store from '@/store'
import useTextStampPickerInvoker from '../Main/MainView/use/textStampPickerInvoker'
import useTextInput from '../Main/MainView/MessageInput/use/textInput'
import useAttachments from '../Main/MainView/MessageInput/use/attachments'
import MessageInputFileList from '@/components/Main/MainView/MessageInput/MessageInputFileList.vue'
import MessageInputUploadButton from '@/components/Main/MainView/MessageInput/MessageInputUploadButton.vue'
import MessageInputInsertStampButton from '@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'

export const targetPortalName = 'share-target-stamp-picker'

export default defineComponent({
  name: 'ShareTargetMessageInput',
  components: {
    MessageInputFileList,
    MessageInputUploadButton,
    MessageInputInsertStampButton
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    isPosting: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { textState, onInputText } = useTextInput()
    const onInput = (e: InputEvent) => {
      onInputText((e.target as HTMLTextAreaElement).value)
    }
    watch(
      () => textState.text,
      val => {
        context.emit('input', val)
      }
    )
    onMounted(() => {
      textState.text = props.value
    })

    const { attachmentsState, addAttachment, destroy } = useAttachments()

    onBeforeUnmount(() => {
      destroy()
    })

    const canPostMessage = computed(
      () => !props.isPosting && !(textState.isEmpty && attachmentsState.isEmpty)
    )

    const textareaRef = shallowRef<HTMLTextAreaElement | null>(null)
    const focus = () => {
      textareaRef.value?.focus()
    }
    onMounted(() => {
      focus()
    })

    const { invokeStampPicker } = useTextStampPickerInvoker(
      targetPortalName,
      textState,
      computed(() =>
        textareaRef.value ? { $el: textareaRef.value } : undefined
      )
    )

    const onStampClick = (e: MouseEvent) => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker()
      }
    }

    // スタンプピッカーに必要
    store.dispatch.entities.fetchStamps()
    store.dispatch.domain.stampCategory.constructStampCategories()
    store.dispatch.entities.fetchStampPalettes()

    const id = randomString()
    return {
      textState,
      onInput,
      attachmentsState,
      addAttachment,
      canPostMessage,
      targetPortalName,
      id,
      textareaRef,
      onStampClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}
.label {
  @include color-ui-secondary;
  display: block;
  margin-bottom: 8px;
}
.wrapper {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  flex: 1;
  border-radius: 4px;

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
.inputContainer {
  flex: 1;
  display: flex;
  align-items: stretch;
}
.inputWrapper {
  @include color-text-primary;
  min-height: 160px;
  width: 100%;
}
.input {
  height: 100%;
  width: 100%;
  color: inherit;
  resize: none;
}
.controls {
  margin-left: 8px;
  align-self: flex-start;
}
.button {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.fileList {
  margin-top: 8px;
}
</style>
