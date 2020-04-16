<template>
  <button
    :class="$style.container"
    :style="styles.container"
    :disabled="disabled"
    @click="context.emit('click')"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.onSecondary
        ? transparentize(theme.accent.primary, 0.5)
        : theme.accent.primary,
      color: 'white'
    }))
  })

export default defineComponent({
  name: 'FormButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles(props)
    return { context, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 32px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
