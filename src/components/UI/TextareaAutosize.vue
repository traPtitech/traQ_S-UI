<template>
  <textarea
    ref="textareaEle"
    v-model="value"
    @compositionupdate="onComposition"
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
import autosize from 'autosize'
import useTextModelSyncer from '@/use/textModelSyncer'

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
    const { value, onComposition } = useTextModelSyncer(props, context)

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

    return { value, onComposition, textareaEle }
  }
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
