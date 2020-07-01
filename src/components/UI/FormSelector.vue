<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div :class="$style.inputContainer" :data-on-secondary="onSecondary">
      <select @input="onInput" :value="value" :id="id" :class="$style.select">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.key }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import useInput from '@/use/input'
import { randomString } from '@/lib/util/randomString'

export default defineComponent({
  name: 'FormSelector',
  props: {
    value: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array as PropType<Array<{ key: string; value: string | null }>>,
      required: true
    },
    label: String
  },
  setup(props, context) {
    const { onInput } = useInput(context)
    const id = randomString()
    return { onInput, id }
  }
})
</script>

<style lang="scss" module>
.label {
  @include color-ui-secondary;
  margin-bottom: 8px;
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

  border: solid 1px transparent;
  &:focus-within {
    border-color: $theme-accent-primary;
  }
}
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
</style>
