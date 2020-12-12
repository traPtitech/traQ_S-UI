<template>
  <textarea
    ref="textareaEle"
    :value="modelValue"
    @input="onInput"
    :class="$style.textarea"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  watch,
  nextTick
} from 'vue'
import useInput from '@/use/input'
import autosize from 'autosize'

export default defineComponent({
  name: 'TextareaAutosize',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    maxHeight: {
      type: Number,
      default: undefined
    }
  },
  setup(props, context) {
    const { onInput } = useInput(context, 'update:modelValue')

    const textareaEle = ref<HTMLTextAreaElement | null>(null)
    onMounted(() => {
      if (textareaEle.value) {
        autosize(textareaEle.value)
      }
    })
    watch(toRef(props, 'modelValue'), async () => {
      await nextTick()
      if (textareaEle.value) {
        autosize.update(textareaEle.value)
      }
    })
    onBeforeUnmount(() => {
      if (textareaEle.value) {
        autosize.destroy(textareaEle.value)
      }
    })

    return { textareaEle, onInput }
  }
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
