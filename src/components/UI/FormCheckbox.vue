<template>
  <label :class="$style.label">
    <form-checkbox-inner v-model="value" />
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'
import FormCheckboxInner from './FormCheckboxInner.vue'

export default defineComponent({
  name: 'FormCheckbox',
  components: {
    FormCheckboxInner
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
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
.label {
  cursor: pointer;

  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}

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
  border: solid 2px $theme-ui-primary;
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
    background: $theme-ui-primary;
  }
}
</style>
