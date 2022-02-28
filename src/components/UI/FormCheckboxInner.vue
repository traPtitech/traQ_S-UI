<template>
  <input
    v-model="value"
    type="checkbox"
    :class="$style.checkbox"
    v-bind="$attrs"
  />
  <div
    :class="$style.pseudoCheckbox"
    role="checkbox"
    :aria-checked="modelValue"
  >
    <div :class="$style.pseudoCheckboxInner" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'

export default defineComponent({
  name: 'FormCheckboxInner',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    onSecondary: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:modelValue': (_val: boolean) => true
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)

    return { value }
  }
})
</script>

<style lang="scss" module>
.checkbox {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
}

.pseudoCheckbox {
  display: inline-block;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 2px $theme-ui-primary-default;
  border-radius: 4px;
  vertical-align: middle;
  &[aria-checked='false'] {
    opacity: 0.5;
  }
}
.pseudoCheckboxInner {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 5px;
  width: 5px;
  margin: auto;
  border-radius: 1px;
  .pseudoCheckbox[aria-checked='true'] & {
    background: $theme-ui-primary-background;
  }
}
</style>
