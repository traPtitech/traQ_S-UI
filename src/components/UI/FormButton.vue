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

const useStyles = (props: { disabled: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.disabled
        ? transparentize(theme.accent.primary, 0.5)
        : theme.accent.primary,
      color: 'white',
      cursor: props.disabled ? 'not-allowed' : ' pointer'
    }))
  })

export default defineComponent({
  name: 'FormButton',
  props: {
    label: {
      type: String,
      default: ''
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
}
</style>
