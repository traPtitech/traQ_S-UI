<template>
  <label :class="$style.label">
    <input
      type="radio"
      :class="$style.radio"
      v-bind="$attrs"
      :value="inputValue"
      :checked="checked"
      v-on="listeners"
    />
    <div
      :class="$style.pseudoRadio"
      role="radio"
      :aria-checked="checked ? 'true' : 'false'"
    >
      <div :class="$style.pseudoRadioInner" />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import useInput from '@/use/input'

export default defineComponent({
  name: 'FormRadio',
  props: {
    /**
     * v-model用なので基本的には直接触らない
     */
    value: {
      type: String,
      default: ''
    },
    /**
     * input要素に渡されるvalue属性
     */
    inputValue: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const checked = computed(() => props.inputValue === props.value)
    const { onInput } = useInput(context)

    const listeners = computed(() =>
      Object.assign({}, context.listeners, {
        input: onInput
      })
    )

    return { checked, listeners }
  }
})
</script>

<style lang="scss" module>
.label {
  cursor: pointer;

  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}

.radio {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
}

.pseudoRadio {
  display: inline-block;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 2px $theme-ui-primary;
  border-radius: 50%;
  &[aria-checked='false'] {
    opacity: 0.5;
  }
}
.pseudoRadioInner {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 5px;
  width: 5px;
  margin: auto;
  border-radius: 50%;
  .pseudoRadio[aria-checked='true'] & {
    background: $theme-ui-primary;
  }
}
</style>
