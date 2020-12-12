<template>
  <textarea-autosize
    ref="textareaAutosizeRef"
    :class="$style.container"
    :model-value="text"
    :readonly="isPosting"
    placeholder="メッセージを送信"
    rows="1"
    @update:model-value="onInput"
    @before-input="onBeforeInput"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @focus="onFocus"
    @blur="onBlur"
    @paste="onPaste"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  SetupContext,
  Ref,
  computed,
  nextTick
} from 'vue'
import useSendKeyWatcher from './use/sendKeyWatcher'
import store from '@/store'
import TextareaAutosize from '@/components/UI/TextareaAutosize.vue'

const useFocus = (context: SetupContext) => {
  const onFocus = () => {
    context.emit('focus')
  }
  const onBlur = () => {
    context.emit('blur')
  }

  return { onFocus, onBlur }
}

const useLineBreak = (
  props: { text: string },
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  context: SetupContext
) => {
  const insertLineBreak = async () => {
    if (!textareaRef.value) return
    const pre = props.text.slice(0, textareaRef.value.selectionStart)
    const suf = props.text.slice(textareaRef.value.selectionEnd)
    const selectionIndex = pre.length + 1
    // inputイベントを発火することでテキストを変更
    context.emit('input-value', `${pre}\n${suf}`)

    await nextTick()
    textareaRef.value.selectionStart = textareaRef.value.selectionEnd = selectionIndex
  }

  return { insertLineBreak }
}

const usePaste = () => {
  const onPaste = (event: ClipboardEvent) => {
    const items = event?.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.kind === 'string') {
        continue
      }
      const file = item.getAsFile()
      if (file) store.dispatch.ui.fileInput.addAttachment(file)
    }
  }
  return { onPaste }
}

export default defineComponent({
  name: 'MessageInputTextArea',
  components: {
    TextareaAutosize
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    isPosting: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const onInput = (value: string) => {
      context.emit('input-value', value)
    }

    const textareaAutosizeRef = ref<{
      $el: HTMLTextAreaElement
    }>()
    const textareaRef = computed(() => textareaAutosizeRef.value?.$el)

    const { insertLineBreak } = useLineBreak(props, textareaRef, context)

    const { onBeforeInput, onKeyDown, onKeyUp } = useSendKeyWatcher(
      context,
      insertLineBreak
    )

    const { onFocus, onBlur } = useFocus(context)
    const { onPaste } = usePaste()

    return {
      onInput,
      onBeforeInput,
      onKeyDown,
      onKeyUp,
      textareaAutosizeRef,
      onFocus,
      onBlur,
      onPaste
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-text-primary;
  width: 100%;
  max-height: 160px;
  &[readonly] {
    @include color-ui-secondary;
    opacity: 0.5;
    cursor: wait;
  }
}
</style>
