<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.selectContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <!-- https://vue-select.org/api/props.html -->
      <v-select
        :id="id"
        v-model="selectedOptionValue"
        :options="options"
        label="key"
        :reduce="(option: Option) => option.value"
        :selectable="(option: Option) => option.value !== null"
        :clearable="false"
        :class="$style.select"
      ></v-select>
    </div>
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
.selectContainer {
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  border: solid 2px transparent;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }
}
.select {
  // https://vue-select.org/guide/css.html
  width: 100%;
  --vs-controls-color: var(--theme-ui-primary-default);
  &:focus-within {
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
