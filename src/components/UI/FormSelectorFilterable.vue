<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <!-- https://vue-select.org/api/props.html -->
    <v-select
      :id="id"
      v-model="selectedOptionValue"
      :options="options"
      label="key"
      :reduce="(option: Option) => option.value"
      :selectable="(option: Option) => option.value !== null"
      :clearable="false"
      :data-on-secondary="$boolAttr(onSecondary)"
      :class="$style.select"
    ></v-select>
  </div>
</template>

<script lang="ts" setup>
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import { randomString } from '/@/lib/basic/randomString'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

type Option = { key: string; value: string | null }
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    onSecondary?: boolean
    options: Array<Option>
    label?: string
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

const selectedOptionValue = useModelValueSyncer(props, emit)
const id = randomString()
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  margin-bottom: 4px;
  display: block;
}
.select {
  // https://vue-select.org/guide/css.html
  height: 30px;
  @include background-secondary;
  &[data-on-secondary] {
    @include background-primary;
  }
  --vs-dropdown-z-index: 1000;

  --vs-controls-color: var(--theme-ui-primary-default);
  --vs-border-width: 0px;
  --vs-border-style: solid;
  --vs-border-radius: 4px;
  &:focus-within {
    --vs-border-width: 2px;
    --vs-border-color: var(--theme-accent-focus-default);
  }

  --vs-dropdown-bg: var(--theme-background-secondary-default);
  &[data-on-secondary] {
    --vs-dropdown-bg: var(--theme-background-primary-default);
  }
  --vs-dropdown-color: var(--theme-ui-primary-default);
  --vs-dropdown-option-color: var(--theme-ui-primary-default);

  --vs-selected-bg: var(--theme-background-primary-default);
  &[data-on-secondary] {
    --vs-selected-bg: var(--theme-background-secondary-default);
  }
  --vs-selected-color: var(--theme-ui-primary-default);

  --vs-search-input-color: var(--theme-ui-primary-default);

  --vs-dropdown-option--active-bg: var(--theme-background-primary-default);
  &[data-on-secondary] {
    --vs-dropdown-option--active-bg: var(--theme-background-secondary-default);
  }
  --vs-dropdown-option--active-color: var(--theme-ui-primary-default);
}
</style>
