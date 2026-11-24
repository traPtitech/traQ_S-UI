<template>
  <div>
    <label v-if="label" :id="labelId" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <!-- https://vue-select.org/api/props.html -->
    <v-select
      v-model="selectedOptionValue"
      :input-id="id"
      :options="options"
      label="key"
      :reduce="(option: Option) => option.value"
      :selectable="(option: Option) => option.value !== null"
      :clearable="false"
      :data-background="background"
      :class="[$style.select, { [$style.customOption]: slots.option }]"
    >
      <template v-if="label || labelledBy" #search="{ attributes, events }">
        <input
          class="vs__search"
          v-bind="attributes"
          :aria-labelledby="labelledBy ?? labelId"
          v-on="events"
        />
      </template>
      <template v-if="slots.option" #option="option">
        <slot name="option" v-bind="option" />
      </template>
      <template v-if="slots.option" #selected-option-container="{ option }">
        <div class="vs__selected">
          <slot name="option" v-bind="option" />
        </div>
      </template>
    </v-select>
  </div>
</template>

<script
  lang="ts"
  setup
  generic="
    T extends string | null,
    Option extends { key: string; value: T | null }
  "
>
import { useId } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const selectedOptionValue = defineModel<T>({ required: true })

const slots = defineSlots<{
  option?: (option: Option) => unknown
}>()

type Background = 'primary' | 'secondary'
withDefaults(
  defineProps<{
    background?: Background
    options: Array<Option>
    label?: string
    labelledBy?: string
  }>(),
  {
    background: 'secondary'
  }
)

const id = useId()
const labelId = `${id}-label`
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
.customOption {
  --option-row-height: 1.875rem;
  --option-row-padding-inline: 1.25rem;
  --vs-actions-padding: 0 0.625rem;
  height: calc(var(--option-row-height) + 2 * var(--vs-border-width));

  :global(.vs__dropdown-toggle),
  :global(.vs__dropdown-menu) {
    padding: 0;
  }

  :global(.vs__selected-options),
  :global(.vs__selected),
  :global(.vs__actions),
  :global(.vs__search) {
    margin: 0;
  }

  :global(.vs__selected-options) {
    min-width: 0;
    flex-wrap: nowrap;
    padding: 0;
  }

  :global(.vs__selected),
  :global(.vs__dropdown-option) {
    display: flex;
    align-items: center;
    min-width: 0;
    min-height: var(--option-row-height);
    padding: 0 var(--option-row-padding-inline);
    line-height: var(--vs-line-height);
  }

  :global(.vs__selected) {
    max-width: 100%;
    border: 0;
  }

  &:global(.vs--open) :global(.vs__search) {
    padding-inline: var(--option-row-padding-inline);
  }
}
</style>
