<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <select
        @input="onInput"
        :value="modelValue"
        :id="id"
        :class="$style.select"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.value === null"
        >
          {{ option.key }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import useInput from '@/use/input'
import { randomString } from '@/lib/util/randomString'

export default defineComponent({
  name: 'FormSelector',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    /**
     * valueがnullのものはdisabled
     */
    options: {
      type: Array as PropType<Array<{ key: string; value: string | null }>>,
      required: true
    },
    label: String
  },
  setup(props, context) {
    const { onInput } = useInput(context, 'update:modelValue')
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

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
</style>
