<template>
  <textarea
    ref="textareaRef"
    :class="$style.container"
    :style="styles.container"
    :value="text"
    placeholder="メッセージを送信"
    @input="onInput"
    @keydown="onKeyDown"
  ></textarea>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  SetupContext,
  watchEffect
} from '@vue/composition-api'
import autosize from 'autosize'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.text.primary
    }))
  })

const useEnterWatcher = (context: SetupContext) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey && event.key === 'Enter') {
      context.emit('post-message')
    }
  }
  return { onKeyDown }
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
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()
    const { onInput } = useInput(context)
    const { onKeyDown } = useEnterWatcher(context)
    const textareaRef = ref<HTMLTextAreaElement>(null)
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
    return {
      styles,
      onInput,
      onKeyDown,
      textareaRef
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
