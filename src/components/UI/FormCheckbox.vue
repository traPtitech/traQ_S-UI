<template>
  <label :class="$style.label">
    <input
      type="checkbox"
      :class="$style.checkbox"
      v-bind="$attrs"
      :checked="value"
      v-on="listeners"
    />
    <div :class="$style.pseudoCheckbox" :style="styles.pseudoCheckbox">
      <div
        :class="$style.pseudoCheckboxInner"
        :style="styles.pseudoCheckboxInner"
      />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'

const useStyles = (props: { value: boolean; onSecondary: boolean }) =>
  reactive({
    pseudoCheckbox: makeStyles(theme => ({
      borderColor: props.value
        ? theme.ui.primary
        : transparentize(theme.ui.primary, 0.5)
    })),
    pseudoCheckboxInner: makeStyles(theme => ({
      backgroundColor: props.value ? theme.ui.primary : 'transparent'
    }))
  })

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
    const styles = useStyles(props)

    const onInput = (event: InputEvent) =>
      context.emit('input', (event.target as HTMLInputElement).checked)

    const listeners = computed(
      () =>
        Object.assign({}, context.listeners, {
          input: onInput
        }) as Record<string, Function>
    )

    return { styles, listeners }
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
  border: solid 2px;
  border-radius: 4px;
  vertical-align: middle;
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
}
</style>
