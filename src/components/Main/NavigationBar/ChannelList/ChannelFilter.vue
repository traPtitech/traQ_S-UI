<template>
  <div :class="$style.container">
    <FilterInput v-model="modelValue" on-secondary disable-ime focus-on-mount />
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue'

const modelValue = defineModel<string>({ required: true })
</script>

<style lang="scss" module>
.container {
  align-items: center;
}
</style>
