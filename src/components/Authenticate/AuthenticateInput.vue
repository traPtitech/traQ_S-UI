<template>
  <div>
    <label :for="id" :class="$style.title" :style="styles.title">{{
      label
    }}</label>
    <input
      :class="$style.input"
      :id="id"
      :style="styles.input"
      :value="text"
      :type="type"
      :autocapitalize="autocapitalize"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  PropType
} from '@vue/composition-api'
import useInput from '@/use/input'
import { makeStyles } from '@/lib/styles'
import { randomString } from '@/lib/util/randomString'

const useStyles = () =>
  reactive({
    title: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    input: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.text.primary
    }))
  })

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
    const styles = useStyles()
    const id = randomString()
    return { styles, onInput, id }
  }
})
</script>

<style lang="scss" module>
.title {
  margin-bottom: 16px;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.input {
  height: 2rem;
  padding: 0.5rem;
  border-radius: 4px;
  width: 100%;
}
</style>
