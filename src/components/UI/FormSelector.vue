<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <select :id="id" v-model="modelValue" :class="$style.select">
        <option
          v-for="option in options"
          :key="option.value ?? nullSymbol"
          :value="option.value"
          :disabled="option.value === null"
        >
          {{ option.key }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { randomString } from '/@/lib/basic/randomString'

const modelValue = defineModel<string | null>({ default: '' })

withDefaults(
  defineProps<{
    onSecondary?: boolean
    options: Array<{ key: string; value: string | null }>
    label?: string
  }>(),
  {
    onSecondary: false
  }
)

const nullSymbol = Symbol('null')

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
  display: flex;
  align-items: center;
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
