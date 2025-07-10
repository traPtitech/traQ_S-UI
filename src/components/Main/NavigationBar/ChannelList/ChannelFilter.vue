<template>
  <div :class="$style.container">
    <div :class="$style.input">
      <filter-input v-model="value" on-secondary disable-ime focus-on-mount />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = defineProps<{
  modelValue: string
  isStarred: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:isStarred', v: boolean): void
}>()

const value = useModelValueSyncer(props, emit)
</script>

<style lang="scss" module>
.container {
  align-items: center;
}
.input {
  margin-right: 16px;
}
</style>
