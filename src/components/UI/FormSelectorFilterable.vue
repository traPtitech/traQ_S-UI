<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <vue-multiselect
      :id="id"
      v-model="selectedOption"
      :options="options"
      track-by="key"
      label="key"
      :class="$style.inputContainer"
      @select="updateModelValue"
    ></vue-multiselect>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { randomString } from '/@/lib/basic/randomString'
import VueMultiselect from 'vue-multiselect'

type Option = { key: string; value: string | null }
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    onSecondary?: boolean
    options: Array<Option>
    label?: string
    activateSearch?: boolean
  }>(),
  {
    modelValue: '',
    onSecondary: false,
    activateSearch: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string | null): void
}>()

const selectedOption = ref<Option | null>(null)
const updateModelValue = (selectedOption: Option) => {
  emit('update:modelValue', selectedOption?.value ?? null)
}
const id = randomString()
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  margin-bottom: 4px;
  display: block;
}
.inputContainer {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
</style>
