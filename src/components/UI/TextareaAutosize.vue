<template>
  <textarea
    ref="textareaEle"
    :value="value"
    :class="$style.textarea"
    :readonly="readonly"
    :placeholder="placeholder"
    :rows="rows"
    :name="name"
    @input="onInput"
  />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, toRef, watch, nextTick } from 'vue'
import autosize from 'autosize'
import useTextModelSyncer from '/@/composables/useTextModelSyncer'

const props = defineProps<{
  modelValue: string
  maxHeight?: number
  readonly?: boolean
  placeholder?: string
  rows?: string
  name?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string): void
}>()

const { value, onInput } = useTextModelSyncer(props, emit)

const textareaEle = ref<HTMLTextAreaElement | null>(null)

const focus = () => {
  textareaEle.value?.focus()
}

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

defineExpose({
  focus
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
