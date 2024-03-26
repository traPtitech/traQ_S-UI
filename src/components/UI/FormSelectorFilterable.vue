<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <v-select
      :id="id"
      v-model="selectedOption"
      :options="options"
      label="key"
      :class="$style.select"
      @option:selected="updateModelValue"
    >
      <template #option="p">
        <div :class="$style.option">{{ p.option.key }}</div>
      </template>
    </v-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
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

const selectedOption = ref<Option | null>(
  props.options.find(o => o.value === props.modelValue) ?? null
)
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
.select {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  border-radius: 4px;
  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.option {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
}
</style>
