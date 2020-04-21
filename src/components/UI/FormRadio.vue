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
    <div :class="$style.pseudoRadio" :style="styles.pseudoRadio">
      <div :class="$style.pseudoRadioInner" :style="styles.pseudoRadioInner" />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, Ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'
import { transparentize } from '@/lib/util/color'

const useStyles = (props: { onSecondary: boolean }, checked: Ref<boolean>) =>
  reactive({
    pseudoRadio: makeStyles(theme => ({
      borderColor: checked.value
        ? theme.ui.primary
        : transparentize(theme.ui.primary, 0.5)
    })),
    pseudoRadioInner: makeStyles(theme => ({
      backgroundColor: checked.value ? theme.ui.primary : 'transparent'
    }))
  })

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
    const styles = useStyles(props, checked)
    const { onInput } = useInput(context)

    const listeners = computed(
      () =>
        Object.assign({}, context.listeners, {
          input: onInput
        }) as Record<string, Function>
    )

    return { styles, checked, listeners }
  }
})
</script>

<style lang="scss" module>
.label {
  cursor: pointer;
}

.radio {
  display: none;
}

.pseudoRadio {
  display: inline-block;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 2px;
  border-radius: 50%;
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
}
</style>
