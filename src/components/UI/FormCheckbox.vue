<template>
  <label :class="$style.label">
    <input
      type="checkbox"
      :class="$style.checkbox"
      v-bind="$attrs"
      :checked="value"
      v-on="listeners"
    />
    <div
      :class="$style.pseudoCheckbox"
      role="checkbox"
      :aria-checked="value ? 'true' : 'false'"
    >
      <div :class="$style.pseudoCheckboxInner" />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'FormCheckbox',
  props: {
    value: {
      type: Boolean,
      default: false
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
    const onInput = (event: InputEvent) =>
      context.emit('input', (event.target as HTMLInputElement).checked)

    const listeners = computed(() =>
      Object.assign({}, context.listeners, {
        input: onInput
      })
    )

    return { listeners }
  }
})
</script>

<style lang="scss" module>
.label {
  cursor: pointer;
}

.checkbox {
  display: none;
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
