<template>
  <textarea
    ref="textareaEle"
    :value="modelValue"
    :class="$style.textarea"
    :readonly="readonly"
    :placeholder="placeholder"
    :rows="rows"
    :name="name"
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
import autosize from 'autosize'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

const focus = () => {
  textareaEle.value?.focus()
}

const autosizeUpdateTextarea = async () => {
  await nextTick()
  if (textareaEle.value) {
    autosize.update(textareaEle.value)
  }
}

onMounted(() => {
  if (textareaEle.value) {
    autosize(textareaEle.value)
    textareaEle.value.addEventListener('autosize:resized', () => {
      emit('autosize-updated')
    })
  }
})
watch([modelValue], autosizeUpdateTextarea)
onBeforeUnmount(() => {
  if (textareaEle.value) {
    autosize.destroy(textareaEle.value)
  }
})

defineExpose({
  focus,
  autosizeUpdateTextarea
})
</script>

<style lang="scss" module>
.textarea {
  resize: none;
}
</style>
