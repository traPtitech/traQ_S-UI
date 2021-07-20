<template>
  <label :class="$style.label">
    <input
      v-model="value"
      type="radio"
      :class="$style.radio"
      v-bind="$attrs"
      :value="inputValue"
    />
    <div :class="$style.pseudoRadio" role="radio" :aria-checked="isChecked">
      <div :class="$style.pseudoRadioInner" />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'

export default defineComponent({
  name: 'FormRadio',
  props: {
    /**
     * v-model用なので基本的には直接触らない
     */
    modelValue: {
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
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)
    const isChecked = computed(() => props.inputValue === value.value)

    return { value, isChecked }
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
