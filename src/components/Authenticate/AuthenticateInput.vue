<template>
  <div>
    <label :for="id" :class="$style.title">{{ label }}</label>
    <input
      :class="$style.input"
      :id="id"
      :value="text"
      :type="type"
      :autocapitalize="autocapitalize"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, PropType } from '@vue/composition-api'
import useInput from '@/use/input'

import { randomString } from '@/lib/util/randomString'

export default defineComponent({
  name: 'AuthenticateInput',
  props: {
    text: { type: String, default: '' },
    label: { type: String, default: '' },
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text' as const
    },
    autocapitalize: {
      type: String,
      default: 'off'
    }
  },
  setup(props, context: SetupContext) {
    const { onInput } = useInput(context)
    const id = randomString()
    return { onInput, id }
  }
})
</script>

<style lang="scss" module>
.title {
  @include color-ui-secondary;
  margin-bottom: 16px;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.input {
  @include background-secondary;
  @include color-text-primary;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
