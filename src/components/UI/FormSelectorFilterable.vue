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
      :data-background="background"
      :class="$style.select"
    />
  </div>
</template>

<script lang="ts" setup>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { randomString } from '/@/lib/basic/randomString'

const selectedOptionValue = defineModel<string | null>({ default: '' })

type Option = { key: string; value: string | null }
type Background = 'primary' | 'secondary'
withDefaults(
  defineProps<{
    background?: Background
    options: Array<Option>
    label?: string
  }>(),
  {
    background: 'secondary'
  }
)

const id = randomString()
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  margin-bottom: 4px;
  display: block;
}
// https://vue-select.org/guide/css.html
.select {
  // background
  @include background-secondary;
  &[data-background='primary'] {
    @include background-primary;
  }
  border-radius: 4px;
  height: 30px;
  :global(.vs__selected-options),
  :global(.vs__actions),
  :global(.vs__selected),
  :global(.vs__search) {
    height: 100%;
    margin: 2px 2px 0;
  }
  :global(.vs__dropdown-toggle) {
    height: 100%;
    align-items: center;
  }

  // Search Input
  --vs-search-input-color: var(--theme-ui-primary-default);

  // Borders
  --vs-border-color: transparent;
  --vs-border-width: 2px;
  --vs-border-style: solid;
  --vs-border-radius: 4px;
  &:focus-within {
    --vs-border-color: var(--theme-accent-focus-default);
  }

  // Controls
  --vs-controls-color: var(--theme-ui-secondary-default);

  // Selected
  --vs-selected-color: var(--theme-ui-primary-default);

  // Dropdown
  --vs-dropdown-bg: var(--theme-background-secondary-default);
  &[data-background='primary'] {
    --vs-dropdown-bg: var(--theme-background-primary-default);
  }

  // Active State
  --vs-dropdown-option--active-bg: var(--theme-background-primary-default);
  &[data-background='primary'] {
    --vs-dropdown-option--active-bg: var(--theme-background-secondary-default);
  }
  --vs-dropdown-option--active-color: var(--theme-ui-primary-default);
}
</style>
