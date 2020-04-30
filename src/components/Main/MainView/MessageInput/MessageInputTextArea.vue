<template>
  <textarea-autosize
    ref="textareaAutosizeRef"
    :class="$style.container"
    :style="styles.container"
    :value="text"
    placeholder="メッセージを送信"
    rows="1"
    @input="onInput"
    @before-input.native="onBeforeInput"
    @keydown.native="onKeyDown"
    @keyup.native="onKeyUp"
    @focus.native="onFocus"
    @blur.native="onBlur"
    @paste.native="onPaste"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  SetupContext,
  Ref,
  computed
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useSendKeyWatcher from './use/sendKeyWatcher'
import store from '@/store'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.text.primary
    }))
  })

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
  const insertLineBreak = () => {
    if (!textareaRef.value) return
    const pre = props.text.slice(0, textareaRef.value.selectionStart)
    const suf = props.text.slice(textareaRef.value.selectionEnd)
    const selectionIndex = pre.length + 1
    // inputイベントを発火することでテキストを変更
    context.emit('input', `${pre}\n${suf}`)

    context.root.$nextTick(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      textareaRef.value!.selectionStart = textareaRef.value!.selectionEnd = selectionIndex
    })
  }

  return { insertLineBreak }
}

const usePaste = () => {
  const onPaste = (event: ClipboardEvent) => {
    const items = event?.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length ?? 0; i++) {
      if (items[i].kind === 'string') {
        continue
      }
      const item = items[i]
      const file = item.getAsFile()
      if (file) store.dispatch.ui.fileInput.addAttachment(file)
    }
  }
  return { onPaste }
}

export default defineComponent({
  name: 'MessageInputTextArea',
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()

    const onInput = (value: string) => {
      context.emit('input', value)
    }

    const textareaAutosizeRef = ref<{ $el: HTMLTextAreaElement }>()
    const textareaRef = computed(() => textareaAutosizeRef.value?.$el)

    const { insertLineBreak } = useLineBreak(props, textareaRef, context)

    const { onBeforeInput, onKeyDown, onKeyUp } = useSendKeyWatcher(
      context,
      insertLineBreak
    )

    const { onFocus, onBlur } = useFocus(context)
    const { onPaste } = usePaste()

    return {
      styles,
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
  width: 100%;
  max-height: 10rem;
}
</style>
