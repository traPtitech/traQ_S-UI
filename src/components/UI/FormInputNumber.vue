<template>
  <FormInput ref="inputRef" v-model="formInputValue" />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import FormInput from './FormInput.vue'
import { defaultProps, type Props } from './FormInputProps'

const modelValue = defineModel<number>({ required: true })

const formInputValue = computed<string | number>({
  get: () => modelValue.value,
  set: newValue => {
    modelValue.value = newValue as number
  }
})

withDefaults(defineProps<Props>(), defaultProps)

const inputRef = ref<InstanceType<typeof FormInput> | null>(null)
const focus = () => {
  inputRef.value?.focus()
}
defineExpose({ focus })
</script>
