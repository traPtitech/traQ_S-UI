<template>
  <textarea
    ref="textareaEle"
    :value="modelValue"
    :class="$style.textarea"
    :readonly="readonly"
    :placeholder="placeholder"
    :rows="rows"
    :name="name"
    dir="auto"
    @input="onInput"
    @beforeinput="e => emit('beforeInput', e)"
    @keydown="e => emit('keydown', e)"
    @keyup="e => emit('keyup', e)"
    @focus="emit('focus')"
    @blur="emit('blur')"
    @paste="e => emit('paste', e)"
  />
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useEventListener } from '@vueuse/core'
import autosize from 'autosize'

import useBoxSize from '/@/composables/dom/useBoxSize'
import useOnInput from '/@/composables/useOnInput'

const modelValue = defineModel<string>({
  required: true
})

defineProps<{
  readonly?: boolean
  placeholder?: string
  rows?: string
  name?: string
}>()

const emit = defineEmits<{
  (e: 'beforeInput', _val: Event): void
  (e: 'keydown', _val: KeyboardEvent): void
  (e: 'keyup', _val: KeyboardEvent): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'paste', _val: ClipboardEvent): void
  (e: 'autosize-updated'): void
}>()

const onInput = useOnInput(modelValue)

const textareaEle = ref<HTMLTextAreaElement | null>(null)
const { width } = useBoxSize(textareaEle)

const focus = () => {
  textareaEle.value?.focus()
}

const autosizeUpdateTextarea = async () => {
  await nextTick()
  if (textareaEle.value) {
    autosize.update(textareaEle.value)
  }
}

useEventListener(textareaEle, 'autosize:resized', () => {
  emit('autosize-updated')
})

onMounted(() => {
  if (textareaEle.value) {
    autosize(textareaEle.value)
  }
})

watch(modelValue, autosizeUpdateTextarea)
watch(width, () => {
  // ResizeObserver の通知中に高さを変更すると、同じ要素の再計測が発生する。
  requestAnimationFrame(autosizeUpdateTextarea)
})

onBeforeUnmount(() => {
  if (textareaEle.value) {
    autosize.destroy(textareaEle.value)
  }
})

defineExpose({
  focus,
  autosizeUpdateTextarea,
  textareaEle
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
