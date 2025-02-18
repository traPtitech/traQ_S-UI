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
import { nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import useTextModelSyncer from '/@/composables/useTextModelSyncer'

const props = defineProps<{
  modelValue: string
  readonly?: boolean
  placeholder?: string
  rows?: string
  name?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string): void
  (e: 'beforeInput', _val: Event): void
  (e: 'keydown', _val: KeyboardEvent): void
  (e: 'keyup', _val: KeyboardEvent): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'paste', _val: ClipboardEvent): void
  (e: 'autosize-updated'): void
}>()

const { value, onInput } = useTextModelSyncer(props, emit)

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
watch([toRef(props, 'modelValue')], autosizeUpdateTextarea)
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
