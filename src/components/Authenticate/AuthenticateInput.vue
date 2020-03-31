<template>
  <div>
    <div :class="$style.title" :style="styles.title">{{ props.title }}</div>
    <input
      :class="$style.input"
      :style="styles.input"
      :value="props.text"
      :type="props.type"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import useInput from '@/use/input'
import { makeStyles } from '@/lib/styles'

type Props = {
  text: string
  title: string
  type: 'text' | 'password'
}

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
    title: { type: String, default: '' },
    type: { type: String, default: 'text' }
  },
  setup(props: Props, context: SetupContext) {
    const { onInput } = useInput(context)
    const styles = useStyles()
    return { props, styles, onInput }
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
