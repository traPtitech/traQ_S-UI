<template>
  <div :class="$style.container">
    <a-slider
      v-model.number="value"
      :class="$style.range"
      :min="min"
      :max="max"
      :disabled="disabled"
      :tooltip="'none'"
      :interval="interval"
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
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import SemiFixedSizeText from './SemiFixedSizeText.vue'
import ASlider from '/@/components/UI/ASlider.vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    maxText: string
    min?: string
    max?: string
    disabled?: boolean
    interval?: number
    format: (v: number) => string
  }>(),
  {
    disabled: false
  }
)

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
  margin-right: 16px;
}
</style>
