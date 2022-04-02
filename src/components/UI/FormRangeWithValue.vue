<template>
  <div :class="$style.container">
    <form-input
      v-model.number="value"
      :class="$style.range"
      type="range"
      :min="min"
      :step="step"
      :max="max"
    />
    <semi-fixed-size-text
      align="right"
      :actual="showValue"
      :placeholder="maxText"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import FormInput from '/@/components/UI/FormInput.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import SemiFixedSizeText from './SemiFixedSizeText.vue'

const props = defineProps<{
  modelValue: number
  maxText: string
  min?: string
  max?: string
  step?: string
  format: (v: number) => string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

const value = useModelValueSyncer(props, emit)

const showValue = computed(() => props.format(value.value))
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.range {
  flex: 1 1;
  margin-right: 4px;
}
</style>
