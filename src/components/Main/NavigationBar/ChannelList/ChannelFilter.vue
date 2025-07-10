<template>
  <div :class="$style.container">
    <div :class="$style.input">
      <filter-input
        v-model="modelValue"
        on-secondary
        disable-ime
        focus-on-mount
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue'

const modelValue = defineModel<string>({ required: true })

defineProps<{
  isStarred: boolean
}>()

defineEmits<{
  (e: 'update:isStarred', v: boolean): void
}>()
</script>

<style lang="scss" module>
.container {
  align-items: center;
}
.input {
  margin-right: 16px;
}
</style>
