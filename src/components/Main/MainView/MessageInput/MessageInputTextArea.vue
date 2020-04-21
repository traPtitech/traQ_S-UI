<template>
  <textarea
    ref="textareaRef"
    :class="$style.container"
    :style="styles.container"
    :value="text"
    placeholder="メッセージを送信"
    @input="onInput"
    @before-input="onBeforeInput"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @focus="onFocus"
    @blur="onBlur"
  ></textarea>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  SetupContext,
  watchEffect,
  PropType,
  Ref
} from '@vue/composition-api'
import autosize from 'autosize'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'
import useSendKeyWatcher from './use/sendKeyWatcher'
import { LineBreakPostProcessState } from './use/lineBreakPostProcess'

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
  props: { text: string; lineBreakPostProcessState: LineBreakPostProcessState },
  textareaRef: Ref<HTMLTextAreaElement | null>,
  context: SetupContext
) => {
  const insertLineBreak = () => {
    if (!textareaRef.value) return
    const pre = props.text.slice(0, textareaRef.value.selectionStart)
    const suf = props.text.slice(textareaRef.value.selectionEnd)
    const newText = `${pre}\n${suf}`
    context.emit('insert-line-break', newText, pre.length + 1)
  }

  watchEffect(() => {
    if (props.lineBreakPostProcessState.shouldRun && textareaRef.value) {
      textareaRef.value!.selectionStart = textareaRef.value!.selectionEnd =
        props.lineBreakPostProcessState.selectionIndex
      autosize.update(textareaRef.value)
      context.emit('line-break-post-process-done')
    }
  })

  return { insertLineBreak }
}

export default defineComponent({
  name: 'MessageInputTextArea',
  props: {
    text: {
      type: String,
      default: ''
    },
    shouldUpdateTextAreaSize: {
      type: Boolean,
      default: false
    },
    lineBreakPostProcessState: {
      type: Object as PropType<LineBreakPostProcessState>,
      required: true
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()
    const { onInput } = useInput(context)

    const textareaRef = ref<HTMLTextAreaElement>(null)
    const { insertLineBreak } = useLineBreak(props, textareaRef, context)

    const { onBeforeInput, onKeyDown, onKeyUp } = useSendKeyWatcher(
      context,
      insertLineBreak
    )

    onMounted(() => {
      if (textareaRef.value) {
        autosize(textareaRef.value)
      }
    })
    watchEffect(() => {
      if (
        (props.shouldUpdateTextAreaSize || props.text.length === 0) &&
        textareaRef.value
      ) {
        autosize.update(textareaRef.value)
      }
    })

    const { onFocus, onBlur } = useFocus(context)

    return {
      styles,
      onInput,
      onBeforeInput,
      onKeyDown,
      onKeyUp,
      textareaRef,
      onFocus,
      onBlur
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  max-height: 10rem;
  resize: none;
  height: 1rem;
}
</style>
