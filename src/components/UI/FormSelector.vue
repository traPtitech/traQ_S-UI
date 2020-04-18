<template>
  <div :style="styles.container" :class="$style.container">
    <select @input="onInput" :value="value" :class="$style.select">
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.key }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary,
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
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput } = useInput(context)
    return { styles, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 30px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
}
.select {
  margin: 0 8px;
  width: 100%;
}
</style>
