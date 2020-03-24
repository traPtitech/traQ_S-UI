<template>
  <textarea
    ref="textareaRef"
    :class="$style.container"
    :style="styles.container"
    :value="props.text"
    @input="onInput"
  ></textarea>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  onMounted,
  SetupContext
} from '@vue/composition-api'
import autosize from 'autosize'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.text.primary
    }))
  })

const useText = (context: SetupContext) => {
  const onInput = (event: InputEvent) =>
    context.emit('input-text', (event.target as HTMLTextAreaElement).value)
  return {
    onInput
  }
}

type Props = {
  text: string
}

export default defineComponent({
  name: 'MessageInputTextArea',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const { onInput } = useText(context)
    const textareaRef = ref<HTMLTextAreaElement>(null)
    onMounted(() => {
      if (textareaRef.value) {
        autosize(textareaRef.value)
      }
    })
    return {
      props,
      styles,
      onInput,
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
