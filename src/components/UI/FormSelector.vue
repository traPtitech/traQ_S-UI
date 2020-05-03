<template>
  <div :style="styles.container">
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div :class="$style.inputContainer" :style="styles.inputContainer">
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
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'
import { randomString } from '@/lib/util/randomString'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    inputContainer: makeStyles(theme => ({
      color: theme.ui.primary,
      background: props.onSecondary
        ? theme.background.primary
        : theme.background.secondary
    }))
  })

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
    const styles = useStyles(props)
    const { onInput } = useInput(context)
    const id = randomString()
    return { styles, onInput, id }
  }
})
</script>

<style lang="scss" module>
.inputContainer {
  @include body1-size;
  height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
}
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
.label {
  margin-bottom: 8px;
  display: block;
}
</style>
