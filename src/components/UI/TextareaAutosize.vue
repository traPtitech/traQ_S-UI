<template>
  <textarea
    ref="textareaEle"
    :value="value"
    :class="$style.textarea"
    @input="onInput"
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
import autosize from 'autosize'
import useTextModelSyncer from '/@/use/textModelSyncer'

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
  setup(props, { emit }) {
    const { value, onInput } = useTextModelSyncer(props, emit)

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

    return { value, onInput, textareaEle }
  }
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
